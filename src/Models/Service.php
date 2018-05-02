<?php

namespace Dataview\IntranetOne;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
	use SoftDeletes;
	
	protected $fillable = ['service','ico','alias','description','order'];
}