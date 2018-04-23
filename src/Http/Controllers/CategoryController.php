<?php
namespace Dataview\IntranetOne;

use App\Http\Controllers\Controller;
use Dataview\IntranetOne\IntranetOne;
use Illuminate\Http\Request;
use App\Http\Requests\CategoryRequest;
use Dataview\IntranetOne\Category;
use DataTables;
use Validator;
use Session;
use Sentinel;

class CategoryController extends Controller
{
    public function list($id=null,$type=null){
      $query = Category::select('id','category_id','category','order')
			->with('maincategory')
      ->orderBy('id','asc')
      ->orderBy('order','asc');
      //subcats
      if($id!==null && $id != 'all')
        $query = $query->where('category_id',$id);

      return IntranetOne::getDataType($query->get(),$type);
  	}
}