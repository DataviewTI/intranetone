<?php
namespace Dataview\IntranetOne;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class City extends Model
{
    use SoftDeletes;
    protected $fillable = ['id','city','region'];
  	protected $dates = ['deleted_at'];

    public function entities(){
      return $this->hasMany('Entity');
    }    
}
