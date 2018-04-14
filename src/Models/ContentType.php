<?php

namespace Dataview\IntranetOne;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Dataview\IntranetOne\Category;
use Dataview\IntranetOne\ContentType;

class ContentType extends Model
{
    use SoftDeletes;
	use Auditable;

    public function categories(){
        return $this->hasMany('Dataview\IntranetOne\Category');
    }
}
