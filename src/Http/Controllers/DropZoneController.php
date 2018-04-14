<?php

namespace Dataview\IntranetOne;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

use App\Http\Requests;
use	Image;
//use App\Http\Controllers\DataviewController as Dataview;

class DropZoneController extends Controller
{
	public function upload(){
    $tmp_name = tempnam(sys_get_temp_dir(),'dz');
    move_uploaded_file($_FILES['file']['tmp_name'],$tmp_name);
		return json_encode([
			'file_name'=>$_FILES['file']['name'],
			'tmp_name'=>$tmp_name,
			'mimetype'=>mime_content_type($tmp_name),
      ]);
	}

	public function getPreviewTemplate($template='default'){
		return view('IntranetOne::io.components.dropzone.dropzone-preview-template-'.$template);
	}
	public function getModal($template='default'){
		return view('IntranetOne::io.components.dropzone.dropzone-infos-modal-'.$template);
	}
}
