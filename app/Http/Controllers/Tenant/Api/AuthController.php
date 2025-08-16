<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    /**
     * Login que soporta tanto autenticación por sesión como por token
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'remember' => 'boolean',
            'use_token' => 'boolean', // Parámetro para indicar si se quiere token API
        ]);

        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember', false);
        $useToken = $request->boolean('use_token', false);

        // Obtener el tenant actual
        $tenant = app('tenancy.tenant');
        if (!$tenant) {
            return response()->json([
                'message' => 'No se encontró el tenant'
            ], 404);
        }

        // Agregar tenant_id a las credenciales
        $credentials['tenant_id'] = $tenant->id;

        // Intentar autenticación
        if (!Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $user = Auth::user();

        // Si se solicita token API, generarlo y devolverlo
        if ($useToken) {
            // Revocar tokens existentes si se desea (opcional)
            // $user->tokens()->delete();

            $token = $user->createToken('api-token', ['*'], now()->addHours(24))->plainTextToken;

            return response()->json([
                'message' => 'Login exitoso',
                'user' => $user,
                'token' => $token,
                'auth_type' => 'token'
            ]);
        }

        // Si no se solicita token, usar autenticación por sesión
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login exitoso',
            'user' => $user,
            'auth_type' => 'session'
        ]);
    }

    /**
     * Renovar token de acceso.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh(Request $request)
    {
        $request->validate([
            'refresh_token' => 'required|string',
        ]);

        $user = Auth::user();
        $tokenData = $user->refreshToken($request->refresh_token);

        if (!$tokenData) {
            return response()->json([
                'message' => 'Token de refresco inválido o expirado',
            ], 401);
        }

        return response()->json([
            'token_type' => 'Bearer',
            ...$tokenData,
        ]);
    }

    /**
     * Cerrar sesión (revocar tokens).
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $user = Auth::user();
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente',
        ]);
    }
} 