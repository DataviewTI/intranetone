<?php
namespace Dataview\IntranetOne\Resolvers;

use Cartalyst\Sentinel\Laravel\Facades\Sentinel;

class UserResolver implements \OwenIt\Auditing\Contracts\UserResolver
{
  public static function resolve() {
      return Sentinel::check() ? Sentinel::getUser() : null;
  }
}