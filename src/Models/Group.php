<?php

namespace Dataview\IntranetOne;

use Dataview\IntranetOne\IOModel;
use Dataview\IntranetOne\File as ProjectFile;
use Dataview\IntranetOne\Video;
use Illuminate\Support\Facades\Storage;

class Group extends IOModel
{
  protected $fillable = ['group','sizes'];

  public function files(){
		return $this->hasMany('Dataview\IntranetOne\File')->orderBy('order');
	}

  public function videos(){
		return $this->hasMany('Dataview\IntranetOne\Video')->orderBy('order');
	}

  public function getSizes($index=false){
    if(!$index)
      return $this->sizes;
	}


  public function getPath($str=''){
    return storage_path((config('intranetone.path_storage')."groups/group_".$this->id."/".$str));
	}

  public function getPartialPath($str=''){
    return "groups/group_".$this->id."".$str;
	}

	public function main(){
    return $this->files->where('order',$this->files->min('order'))->first();
  }

  public function manageImages($files,$params)
  {
    $_imgs = [];
    $params = (object) $params;
    
		foreach($files as $img)
		{
      $img  = (object) $img;
			//$img->date = empty($img->date) ? null : $img->date;
			if($img->id == null){
				$_img = new ProjectFile([
					"file" => $img->name,
					"data" => json_encode($img->data),
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
					"data" => json_encode($img->data),
					"mimetype" => $img->mimetype,
					"order" => $img->order
				]);	
				array_push($_imgs,$img->id);
			}
		}
		
		//generate te intersection between updates and all images, the result are the registers to be deleted
		$to_remove = array_diff(array_column($this->files()->get()->toArray(),'id'),$_imgs);
		ProjectFile::destroy($to_remove);
	}

  public function manageVideos($videos)
  {
    $_videos = [];
    
		foreach($videos as $video)
		{
			if(!property_exists($video, 'dbId') || $video->dbId == null || $video->dbId == ""){
				$_video = new Video([
          'url' => $video->url,
          'order' => $video->order,
          'source' => $video->source,
          'title' => $video->infos->title,
          'description' => $video->infos->description,
          'thumbnail' => json_encode($video->thumbnail),
          'data' => json_encode($video),
        ]);
				$this->videos()->save($_video);
				array_push($_videos,$_video->id);
			}else{
				$__upd = Video::find($video->dbId);//->id)->get();
				$__upd->update([
          'url' => $video->url,
          'order' => $video->order,
          'source' => $video->source,
          'title' => $video->infos->title,
          'description' => $video->infos->description,
          'thumbnail' => json_encode($video->thumbnail),
          'data' => json_encode($video),
				]);	
				array_push($_videos,$video->dbId);
			}
		}
		//generate te intersection between updates and all videos, the result are the registers to be deleted
		$to_remove = array_diff(array_column($this->videos()->get()->toArray(),'id'),$_videos);
		Video::destroy($to_remove);
	}

 
  public static function boot() { 
    parent::boot(); 

    static::created(function (Group $obj) {
      Storage::makeDirectory($obj->getPartialPath(), 0775, true);
    });
  }
  

}
