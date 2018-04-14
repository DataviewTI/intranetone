<?php

namespace Dataview\IntranetOne;

/* IMPORTANTE = generalizar a group, e estender dentro das classes separadamente */

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Dataview\IntranetOne\File as ProjectFile;
use Illuminate\Support\Facades\Storage;

class Group extends Model
{
	protected $fillable = ['group','description'];
	protected $dates = ['deleted_at'];

    public function news(){
		return $this->hasOne('Dataview\IntranetOne\News');
	}	

	public function slide(){
		return $this->hasOne('Dataview\IntranetOne\Slide','id');
	}	

    public function document(){
		return $this->hasOne('Dataview\IntranetOne\Document');
	}	

	public function files(){
		return $this->hasMany('Dataview\IntranetOne\File')->orderBy('order');
	}	

	public function getPath($str=''){
    return storage_path((config('intranetone.path_storage')."groups/group_".$this->id."/".$str));
	}	
	public function getPartialPath($str=''){
    return "groups/group_".$this->id."".$str;
	}	

	public function main(){
    return $this->files->where('order',0)->first();
  }

    public function manageImages($files,$params)
  {
    $_imgs = [];
    $params = (object) $params;
    
		foreach($files as $img)
		{
      $img  = (object) $img;

			$img->date = empty($img->date) ? null : $img->date;
			if($img->id == null)
			{
				$_img = new ProjectFile([
					"file" => $img->name,
					"caption" => $img->caption,
					"date" => $img->date,
					"details" => $img->details,
					"mimetype" => $img->mimetype,
					"order" => $img->order,
				]);
				$_img->setTmp($img->tmp);
				$_img->setOriginal($params->original);
				foreach($params->sizes as $p => $v){
          $v = (object) $v;
					$_img->setSize($p,$v->w,$v->h);
        }
				$this->files()->save($_img);
				array_push($_imgs,$_img->id);
			}
			else{
				$__upd = ProjectFile::find($img->id);//->id)->get();
				$__upd->update([
					"file" => $img->name,
					"caption" => $img->caption,
					"date" => $img->date,
					"details" => $img->details,
					"mimetype" => $img->mimetype,
					"order" => $img->order
				]);	
					
					//$__upd->save();
				//Audit Updated
				//if($audit = Auditor::execute($img))
					//Auditor::prune($img);

				array_push($_imgs,$img->id);
			}
		}
		
		//generate te intersection between updates and all images, the result are the registers to be deleted
		$to_remove = array_diff(array_column($this->files()->get()->toArray(),'id'),$_imgs);
		ProjectFile::destroy($to_remove);
	}

	public function manageFiles($files,$params)
  	{	
		$_files = [];
		foreach($files as $file)
		{				
			$file->date = empty($file->date) ? null : $file->date;
			if($file->id == null)
			{
				$_file = new ProjectFile([
					"file" => $file->name,
					"caption" => $file->caption,
					"date" => $file->date,
					"details" => $file->details,
					"mimetype" => $file->mimetype,
					"order" => $file->order,
				]);

				$_file->setTmp($file->tmp);
				$_file->setOriginal($params->original);				
				// foreach($params->sizes as $p => $v)
				// 	$_file->setSize($p,$v->w,$v->h);
				
				$this->files()->save($_file);
				array_push($_files,$_file->id);
			}
			else{
				$__upd = ProjectFile::find($file->id);//->id)->get();
				$__upd->update([
					"file" => $file->name,
					"caption" => $file->caption,
					"date" => $file->date,
					"details" => $file->details,
					"mimetype" => $file->mimetype,
					"order" => $file->order
				]);	
					
					//$__upd->save();
				//Audit Updated
				//if($audit = Auditor::execute($img))
					//Auditor::prune($img);

				array_push($_files,$file->id);
			}
		}
		
		//generate te intersection between updates and all images, the result are the registers to be deleted
		$to_remove = array_diff(array_column($this->files()->get()->toArray(),'id'),$_files);
		ProjectFile::destroy($to_remove);
  }
  
  public static function boot() { 
    parent::boot(); 

    static::created(function (Group $obj) {
      //Storage::makeDirectory($obj->getPath(), 0775, true);
      Storage::makeDirectory($obj->getPartialPath(), 0775, true);
    });
  }
  

}
