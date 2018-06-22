<?php

namespace Dataview\IntranetOne;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class IOModel extends Model implements AuditableContract
{
  use Auditable;
	use SoftDeletes;
  protected $auditTimestamps = true;

  protected $appends = ['temp'=>null];
  protected $dates = ['deleted_at'];

  public function setAppend($index,$value){
		$this->appends[$index] = $value;
  }

  public function getAppend($index){
		return $this->appends[$index];
  }
  
  public static function pkgAddr($addr){
    return __DIR__.'/'.$addr;
  } 
}
