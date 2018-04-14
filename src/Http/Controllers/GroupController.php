<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\File;
use App\Group;

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
