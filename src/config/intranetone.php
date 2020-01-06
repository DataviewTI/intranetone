<?php
use Dataview\IOConfig\Config;

$__config = [
  'pathStorage'=>"app/public/intranetone/",
];

try{

  $default = Dataview\IOConfig\Config::select('id','name','group_id','configuration')
  ->where('name','default')
  ->whereNull('user_id')
  ->first() ?: [];

  if(filled($default)){
//    $__config = [];
    $logo=[];
    $__config = $default->toArray();
    foreach($default->group->sizes['sizes'] as $key=>$value)
      $logo{"logo"}{$key} = $default->group->main()->getPath(['size'=>$key]);
    
    $__config = array_merge([
      "id"=> $__config{'id'},
      "name"=> $__config{'name'},
      "group_id"=>$__config{'group_id'},
    ],
    array_merge($__config{'configuration'},$logo));
  }
}
catch(Exception $e){
}
finally{
  return $__config;
}

