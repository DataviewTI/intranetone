<?php

namespace Dataview\IntranetOne;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Dataview\IntranetOne\File;
use Dataview\IntranetOne\Group;

class GroupController extends Controller
{
  public function getFileByGroup($grouId){
    $files = Group::find($grouId)->files();
  }

  public function getFile($fileId,$size=null){
    $file = File::find($fileId);
    return $file->getFile(['size'=>$size]);
	}
}
