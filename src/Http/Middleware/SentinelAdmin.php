<?php

// namespace App\Http\Middleware;
namespace Dataview\IntranetOne\Http\Middleware;

use App\Task;
use Closure;
use Sentinel;

class SentinelAdmin
{
    public function handle($request, Closure $next)
    {
      if(!Sentinel::check() || (!Sentinel::inRole('frontendUser') && !Sentinel::inRole('admin') && !Sentinel::inRole('user') && !Sentinel::inRole('odin')))
        return redirect('admin/signin')->with('info', 'You must be logged in!');
      
       return $next($request);
            
    }
}
