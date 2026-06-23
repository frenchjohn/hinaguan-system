<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response|RedirectResponse
    {
        if ($request->session()->has('auth_user')) {
            $role = $request->session()->get('auth_user.role');

            return redirect()->route($role === 'admin' ? 'admin.dashboard' : 'staff.dashboard');
        }

        return $next($request);
    }
}
