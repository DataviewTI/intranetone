<?php

namespace App\Http\Middleware;

use App\Task;
use Closure;
use Sentinel;

class SentinelAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
      if(!Sentinel::check() || !Sentinel::inRole('admin'))
        return redirect('admin/signin')->with('info', 'You must be logged in!');
      
       return $next($request);
            
    }
}
