<?php
namespace Dataview\IntranetOne;

use App\Http\Controllers\Controller;
use Dataview\IntranetOne\IntranetOne;
use Illuminate\Http\Request;
use Dataview\IntranetOne\CategoryRequest;
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
    
    public function create(CategoryRequest $request){
      $obj = new Category($request->all());
      $obj->save();

      // dump($request->all());

      return response()->json(['success'=>true,'data'=>null]);
    }
    
    public function update(CategoryRequest $request){
      $_new = (object) $request->all();
			$_old = Category::find($request['edit']);
			
      $_old->category = $_new->category;
      $_old->category_id = $_new->category_id;
      $_old->description = $_new->description;
      
			$_old->save();

      return response()->json(['success'=>true,'data'=>null]);
    }

    public function delete($id){
      $obj = Category::find($id);

      if($obj->erasable == 1){
        $obj = $obj->delete();
        return  json_encode(['sts'=>$obj]);
      }

      return  json_encode(['sts'=>false]);
    }

    public static function organizeChildCategories($category, $result){
      $r = $result;
      foreach ($category as $c) {
        array_push($r, $c);
        $r = self::organizeChildCategories($c->childCategories, $r);
      }
      return $r;
    }
  
    public static function serviceChildCategories($service=null){

      $categories = Category::select('id','category','category_id', 'description')
      ->where('id',$service)
      ->with('childCategories')
      ->get();
  
      $childCategories = array();
      $childCategories = self::organizeChildCategories($categories[0]->childCategories, $childCategories);
      
      // return Datatables::of(collect($childCategories))->make(true);
      return collect($childCategories);
    }

    public static function dtServiceChildCategories($service=null){

      $categories = Category::select('id','category','category_id', 'description')
      ->where('id',$service)
      ->with('childCategories')
      ->get();
  
      $childCategories = array();
      $childCategories = self::organizeChildCategories($categories[0]->childCategories, $childCategories);
      
      return Datatables::of(collect($childCategories))->make(true);
      // return collect($childCategories);
    }
    
}