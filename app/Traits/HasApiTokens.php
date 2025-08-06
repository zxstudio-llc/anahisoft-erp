<?php

namespace App\Traits;

use Laravel\Sanctum\HasApiTokens as SanctumHasApiTokens;
use Laravel\Sanctum\NewAccessToken;
use Carbon\Carbon;

trait HasApiTokens
{
    use SanctumHasApiTokens;

    /**
     * Crear un nuevo token de acceso con renovación automática.
     *
     * @param string $name
     * @param array $abilities
     * @return array
     */
    public function createTokenWithRefresh(string $name, array $abilities = ['*']): array
    {
        // Eliminar tokens anteriores del usuario
        $this->tokens()->delete();

        // Crear token principal que expira en 60 minutos
        $token = $this->createToken($name, $abilities);
        $expiresAt = now()->addMinutes(60);

        // Crear token de refresco que expira en 24 horas
        $refreshToken = $this->createToken($name . '_refresh', ['refresh-token']);
        $refreshExpiresAt = now()->addHours(24);

        return [
            'access_token' => $token->plainTextToken,
            'access_token_expires_at' => $expiresAt->toDateTimeString(),
            'refresh_token' => $refreshToken->plainTextToken,
            'refresh_token_expires_at' => $refreshExpiresAt->toDateTimeString(),
        ];
    }

    /**
     * Renovar el token de acceso usando el token de refresco.
     *
     * @param string $refreshToken
     * @return array|null
     */
    public function refreshToken(string $refreshToken): ?array
    {
        $token = $this->tokens()->where('token', hash('sha256', $refreshToken))->first();

        if (!$token || !$token->can('refresh-token')) {
            return null;
        }

        // Verificar si el token de refresco ha expirado (24 horas)
        if (Carbon::parse($token->created_at)->addHours(24)->isPast()) {
            $token->delete();
            return null;
        }

        // Eliminar todos los tokens anteriores
        $this->tokens()->delete();

        // Crear nuevo token de acceso
        return $this->createTokenWithRefresh('api_token');
    }
} 