<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantNotFound extends Exception
{
    /**
     * Render the exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response|\Inertia\Response
     */
    public function render(Request $request)
    {
        if ($request->wantsJson()) {
            return response()->json([
                'message' => $this->getMessage() ?: 'Tenant not found',
                'domain' => $request->getHost()
            ], 404);
        }

        return Inertia::render('Errors/TenantNotFound', [
            'status' => 404,
            'message' => $this->getMessage() ?: 'Tenant not found',
            'domain' => $request->getHost(),
            'centralDomain' => config('tenancy.central_domains')[0] ?? null
        ]);
    }
}
