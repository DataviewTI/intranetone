<?php

namespace Dataview\IntranetOne;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Dataview\IntranetOne\ContentType;
use Dataview\IntranetOne\Category;

class Category extends Model implements AuditableContract
{
	use SoftDeletes;
	use Auditable;
	
	protected $fillable = ['category_id','content_type_id','category','description','order'];
	
	public function parent(){
		return $this->belongsTo('Dataview\IntranetOne\Category', 'category_id');
	}

	public function teste(){
		return $this->belongsToMany('Dataview\IntranetOne::Category')->withPivot('category_id');
	}
	
	public function subcategories(){
		return $this->hasMany('Dataview\IntranetOne\Category','category_id');
	}

	public function contentType(){
        return $this->belongsTo('Dataview\IntranetOne\ContentType','content_type_id');
    }

	/*public function _category(){
		return $this->belongsTo(self::class,'category_id');
	}*/
}