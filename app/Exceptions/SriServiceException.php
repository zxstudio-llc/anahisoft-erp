<?php

namespace App\Exceptions;

use Exception;

class SriServiceException extends Exception
{
    public function __construct(string $message = "Servicio del SRI no disponible")
    {
        parent::__construct($message);
    }
}