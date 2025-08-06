<?php

namespace App\Exceptions;

use Exception;

class SriNotFoundException extends Exception
{
    public function __construct(string $identification)
    {
        parent::__construct("El RUC {$identification} no fue encontrado en los registros del SRI");
    }
}