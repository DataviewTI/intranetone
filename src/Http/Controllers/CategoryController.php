<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\CategoryRequest;
use App\Category;
use App\ContentType;
use DataTables;
use Validator;
use Session;
use Sentinel;

class CategoryController extends Controller
{
    public function index(){
        return view('admin.categories.index');
    }

    public function list($id=null,$type=null){
      $query = Category::select('id','category_id','category','content_type_id','order')
			->with('parent')
			->with('contentType')
      ->orderBy('id','asc');
      //subcats
      if($id!==null && $id != 'all')
        $query = $query->where('category_id',$id);

      return getDataType($query->get(),$type);
  	}

    public function create(){
    }

    public function store(CategoryRequest $request){
      if(!Sentinel::getUser()->hasAccess('category.create')){
          return response()->json(['error' => 'Você não tem permissão para cadastrar novas categorias!'], 403);
      }else{
          $validator = Validator::make($request->all(),$request->rules(),$request->messages());

          if($validator->fails())
              return response()->json(['errors' => $validator->errors()->all()], 422);
          else{
              // dump($request->all());
              $category = Category::create($request->all());
              // dump($category);
              return response()->json(['success'=>true,'data'=>null]);
          }
      }   
    }

    public function show($id){
    }

    public function edit($id){
        if(!Sentinel::getUser()->hasAccess('category.view')){
            return response()->json(['error' => 'Você não tem permissão para visualizar este registro!'], 403);
        }else{
            $query = Category::select('id','category_id','content_type_id','category','description')
                    ->where('id',$id)
                    ->get();
            return response()->json(['success'=>true,'data'=>$query]);
        }   
  	}

    public function update($id,CategoryRequest $request){
        if(!Sentinel::getUser()->hasAccess('category.update')){
            return response()->json(['error' => 'Você não tem permissão para alterar este registro!'], 403);
        }else{
            $_new = (object) $request->all();
            $_old = Category::find($id);
            
            $_old->category = $_new->category;
            $_old->description = $_new->description;	
            $_old->content_type_id = $_new->content_type_id;	
            $_old->category_id = $_new->category_id;

            // dump($_old);	
            // dump($_new);	
            
            $_old->save();
            return response()->json(['success'=>$_old->save()]);
        }   
	}

  public function destroy($id){
    if(!Sentinel::getUser()->hasAccess('category.delete')){
        return response()->json(['error' => 'Você não tem permissão para remover este registro!'], 403);
    }else{
        $obj = Category::find($id);
        $obj = $obj->delete();
        return  json_encode(array('sts'=>$obj));
    }   
	}  

  public function getCategoriesByType($typeId){
      return json_encode(Category::select('id as value','category as text')->where('content_type_id',$typeId)->where('category_id',null)->orderBy('id','asc')->get());
  }

  public function getTypes(){
        return json_encode(ContentType::select('id as value','type as text')->orderBy('id','asc')->get());
	}

  public function getCategories(){
        return json_encode(Category::select('id as value','category as text')->orderBy('category','asc')->where('category_id','=',NULL)->get());
  }
    
    public function getSubCategories($catId=null){        
        return json_encode(Category::select('id as value','category as text')->where('category_id',$catid)->orderBy('category','asc')->get());
	}
}