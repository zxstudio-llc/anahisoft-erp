<?php

use Illuminate\Support\Facades\Broadcast;
// Canal privado para usuarios autenticados
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Canal público para el estado del tenant
Broadcast::channel('tenant.status', function () {
    return true;
});

// Canal privado para el tenant específico
Broadcast::channel('tenant.{id}', function ($user, $id) {
    // Verificar si el usuario pertenece al tenant
    return tenant() && tenant()->id === $id;
});

// Canal privado para administradores centrales
Broadcast::channel('admin', function ($user) {
    // Solo los usuarios con rol de admin pueden escuchar este canal
    return $user->hasRole('admin');
});

