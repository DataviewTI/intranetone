<?php

namespace Dataview\IntranetOne;

use Dataview\IntranetOne\IOModel;
use Dataview\IntranetOne\Category;

class Category extends IOModel
{
	
	protected $fillable = ['category_id','category','erasable','description','order'];
	
  public function maincategory(){
      return $this->belongsTo('Dataview\IntranetOne\Category', 'category_id');
  }

  public function subcategories(){
      return $this->hasMany('Dataview\IntranetOne\Category', 'category_id');
  }
}