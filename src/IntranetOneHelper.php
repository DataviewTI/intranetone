<?php

namespace Dataview\IntranetOne;


class IntranetOneHelper
{
  static function getIORoute($m){
    return "dataview\intranetone\AuthController@".$m;
  }
}
