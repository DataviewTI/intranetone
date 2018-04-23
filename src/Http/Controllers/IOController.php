<?php
namespace Dataview\IntranetOne;
  
use App\Http\Controllers\Controller;
use Illuminate\Http\Response;
use Validator;
use DataTables;
use Session;
use Sentinel;
use Dataview\IntranetOne\IORequest;

class IOController extends Controller{

  protected $service;

  public function checkPermissions($method){
    if(!Sentinel::getUser()->hasAccess($this->service.'.'.$method))
      return [
        "status"=>false,
        "errors"=>[
          'title'=> __('io_validation.'.$method.'.no_access', ['service' => str_plural($this->service)])
        ],
        "code"=>403
      ];

      return [
        "status"=>true,
        "errors"=>[]
      ];      
  }
    
  public function __create(IORequest $request){
    $method = substr(__FUNCTION__,2);
    $check = $this->checkPermissions($method);
    
    if(!$check['status'])
      return $check;
    else{
      $validator = Validator::make($request->all(),$request->rules(),$request->messages());
      if($validator->fails())
        return [
          "status"=>false,
          "errors"=>[
            $validator->errors()->all()
          ],
          "code"=>422
        ];
    }
    return $check;
  }

  public function __update(IORequest $request){
    $method = substr(__FUNCTION__,2);
    $check = $this->checkPermissions($method);
    
    if(!$check['status'])
      return $check;
    else{
      $validator = Validator::make($request->all(),$request->rules(),$request->messages());
      if($validator->fails())
        return [
          "status"=>false,
          "errors"=>[
            $validator->errors()->all()
          ],
          "code"=>422
        ];
    }
    return $check;
  }


  public function __view(){
    return $this->checkPermissions(substr(__FUNCTION__,2));
  }
  
  public function __delete(){
    return $this->checkPermissions(substr(__FUNCTION__,2));
  }
  
}
