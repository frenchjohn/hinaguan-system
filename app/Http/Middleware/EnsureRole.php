<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $role): Response|RedirectResponse
    {
        $user = $request->session()->get('auth_user');

        if (! $user || $user['role'] !== $role) {
            return redirect()->route('login');
        }

        return $next($request);
    }
}
