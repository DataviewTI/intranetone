<?php
namespace Dataview\IntranetOne;

use Dataview\IntranetOne\IOController;
use Dataview\IntranetOne\IntranetOneController;
use Illuminate\Support\Str;
use Dataview\IntranetOne\IntranetOne;
use Illuminate\Http\Request;
use Dataview\IntranetOne\CategoryRequest;
use Dataview\IntranetOne\Category;
use DataTables;
// use Validator;
// use Session;
use Sentinel;

class CategoryController extends IOController
{
  public function __construct(){
    $this->service = 'category';
  }
  
  
    // public function list($id=null,$type=null){
    //   $query = Category::select('id','service_id','category_id','category','order')
		// 	->with('maincategory')
		// 	->with('service')
    //   ->orderBy('id','asc')
    //   ->orderBy('order','asc');
    //   //subcats
    //   if($id!==null && $id != 'all')
    //     $query = $query->where('category_id',$id);

    //   return IntranetOne::getDataType($query->get(),$type);
    // }
    
    public function list(Request $req){
      
      $r = (object) $req->all();

      $query = Category::select('id','service_id','category_id','category as cat','order','erasable')
			->with([
        'service'=>function($query){
          $query->select('trans','service','id','alias');
        },
        'category'=>function($query){
          $query->select('service_id','id','category','category_id')
          ->with([
            'service'=>function($query){
              $query->select('service','id');
          }]);
      }])
      ->orderBy('id','asc')
      ->orderBy('order','asc');

      //subcats
      if(filled(optional($r)->category))
        $query = $query->where('category_id',$r->category);
      
      if(optional($r)->onlyCategories == true)
        $query = $query->whereNull('category_id');
        
      if(filled(optional($r)->service)){
        if($r->service != "all") { 
          $servId = Service::where('service',$r->service)->value('id');
          if(filled($servId))
            $query = $query->where('service_id',$servId);
        }
      }
      else
        $query = $query->whereNull('service_id');


      return IntranetOne::getDataType($query->get(),optional($r)->type);
    }



  public function services(){
    $servs = IntranetOneController::getServices();
    $items=[];
    foreach($servs as $s){
      if(Sentinel::getUser()->hasAccess(Str::slug($s->alias).".*"))
        array_push($items,[
            "service" => $s->service,
            "trans" => $s->trans,
            "alias" => $s->alias,
            "id" => $s->id
          ]
        );
    }
    return response()->json($items);
  }


    public function create(CategoryRequest $request){

      $obj = new Category($request->all());
      $ret = $obj->save();

      // // dump($request->all());

      return response()->json(['success'=>$ret,'data'=>null]);
    }
    
    public function update($id, CategoryRequest $request){
      // $check = $this->__update($request);
      // if (!$check['status']) {
      //     return response()->json(['errors' => $check['errors']], $check['code']);
      // }

      $_new = (object) $request->all();

      $_old = Category::find($id);

      $upd = ['service_id','category_id','category','category_slug','erasable','config'];  


      foreach($upd as $u)
        $_old->{$u} = optional($_new)->{$u};

      $_old->save();
      return response()->json(['success' => $_old->save()]);    
    }

    public function delete($id){
      $obj = Category::find($id);

      if($obj->erasable == 1){
        $obj = $obj->forceDelete();
        return  json_encode(['sts'=>$obj]);
      }

      return  json_encode(['sts'=>false]);
    }

	public function view($id){
    //CREATE AS a HIDDEN SERVICE
    // $check = $this->__view();
    // if (!$check['status']) {
    //     return response()->json(['errors' => $check['errors']], $check['code']);
    // }

      $query = Category::select('id','service_id','category_id','category as cat','order','config','erasable')
			->with([
        'service'=>function($query){
          $query->select('trans','service','id','alias');
        },
        'category'=>function($query){
          $query->select('service_id','id','category','category_id')
          ->with([
            'service'=>function($query){
              $query->select('service','id');
          }]);
      }])
      ->where('id',$id)->get();
          
    return response()->json(['success' => true, 'data' => $query]);
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