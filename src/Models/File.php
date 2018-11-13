<?php

namespace Dataview\IntranetOne;

use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Model;
use	Image;
use Illuminate\Http\File as LaravelFile;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class File extends Model implements AuditableContract
{
	use Auditable;
	protected $auditTimestamps = true;
	protected $fillable = ['file','mimetype','order','data'];
	protected $appends = ['tmp'=>null,"original"=>false,'sizes'=>null];

  public function group(){
		return $this->belongsTo('Dataview\IntranetOne\Group');
	}

  protected $casts = [
    'data' => 'array',
  ];
  
  public function setDataAttribute($value){
    $this->attributes['data'] = stripslashes($value);
  }

// IMAGES ///////////////////////////////////////////////////////////////////

	public function setOriginal($bool){
		$this->appends['original'] = $bool;
		return $this;
	}

	public function keepOriginal(){
		$this->appends['original'];
	}

	public function setSize($s,$w,$h){
		$this->appends['sizes'][$s] = ["w"=>$w,"h"=>$h];
		return $this;
	}

	public function makeCopies(){
		if(preg_match('/[i][m][a][g][e][\/].*/',$this->mimetype)){
			if($this->appends['sizes'] != null){
				foreach($this->appends['sizes'] as $pre => $copy)
					Image::make($this->getTmp())
						->widen($copy['w'])
						->fit($copy['w'],$copy['h'])
						->save($this->group->getPath().$pre.'_'.$this->file);
			}
		
			if($this->appends['original'])
				Image::make($this->getTmp())
				->save($this->group->getPath().$this->file);
		}else{
      //upload de arquivos que não são imagens
		  //Storage::putFileAs($this->group->getPath(), new LaravelFile($this->getTmp()), $this->file, 'public');
		}
		return $this;
	}

	public function getSize($s){
		return $this->appends['sizes'][$s];
	}

	public function setTmp($str){
		$this->appends['tmp'] = $str;
		return $this;
  }
  

  
  public function getData($index=null,$key=null){
    //$data = json_decode($this->data);
    return $index == null ? $data : ($key==null ? $data->{$index} : $data->{$index}->{$key});

    /*try{
      return $index == null ? $data : $key==null ? $data->{$index} : $data->{$index}->{$key}; 
    }
    catch(Exception $e){}
    return null;*/
  }

	public function getTmp(){
		return $this->appends['tmp'];
	}

	public function getPath($attrs=[]){
		$size = empty($attrs['size']) ? '' : $attrs['size'].'_';
    return '/storage/intranetone/'.$this->group->getPartialPath('/'.$size.$this->file);
	}

  public function getSRCImg($attrs=[]){
    return public_path($this->getPath($attrs));
	}

	public function getFile($attrs=[]){
    return response()->download($this->getSRCImg($attrs));
  }
  
  public function getHTMLImg($attrs=[]){
		$img = "<img src = '".($this->getPath($attrs))."' alt = '".$this->title."' title = '".$this->title."' ";
		foreach($attrs as $key => $value)
			$img.= $key."='".$value."' ";
			
		return $img." />";
	}

  public static function boot() { 
    parent::boot(); 

    static::created(function (File $file){
      $file->makeCopies();
    });

    static::deleted(function (File $file){
      $all_files = Storage::files($file->group->getPartialPath());
      $filtered_files = preg_grep("/(".$file->file.")/", $all_files);
      Storage::delete($filtered_files);
    });
  }

}
