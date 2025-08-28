<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Check if we're in a tenant context
        $isTenant = tenancy()->initialized;
        
        $rules = [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
        
        // No se requiere RUC en ningún contexto
        // El sistema buscará el tenant por email
        
        return $rules;
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Verificar si estamos en un contexto de tenant o en central
        $isTenant = tenancy()->initialized;
        
        // Si estamos en un tenant, asegurarse de que el usuario pertenece a este tenant
        if ($isTenant) {
            $tenant = tenancy()->tenant;
            
            // Intentar autenticar con tenant_id
            if (! Auth::attempt(array_merge(
                $this->only('email', 'password'),
                ['tenant_id' => $tenant->id]
            ), $this->boolean('remember'))) {
                RateLimiter::hit($this->throttleKey());
                
                throw ValidationException::withMessages([
                    'email' => trans('auth.failed'),
                ]);
            }

            // Si la autenticación es exitosa y es una petición API, asegurarse de que el usuario tenga los permisos necesarios
            if ($this->wantsJson()) {
                $user = Auth::user();
                if (!$user->tokenCan('*')) {
                    throw ValidationException::withMessages([
                        'email' => trans('auth.unauthorized'),
                    ]);
                }
            }
        } else {
            // Autenticación normal para el contexto central
            if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
                RateLimiter::hit($this->throttleKey());
                
                throw ValidationException::withMessages([
                    'email' => trans('auth.failed'),
                ]);
            }
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->input('email')).'|'.$this->ip());
    }
}
