<?php

namespace Dataview\IntranetOne;

use Dataview\IntranetOne\IOModel;
use Dataview\IntranetOne\Category;

class Category extends IOModel
{
	protected $fillable = ['category_id','category','category_slug','erasable','description','config','order'];
	
  protected $casts = [
    'config' => 'array',
  ];


  public function maincategory(){
      return $this->belongsTo('Dataview\IntranetOne\Category', 'category_id');
  }

  public function subcategories(){
      return $this->hasMany('Dataview\IntranetOne\Category', 'category_id');
  }

  // recursive
  public function childCategories(){
      return $this->subcategories()->with('childCategories');
  }

}