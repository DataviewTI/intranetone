<?php

namespace Dataview\IntranetOne;

use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Model;
use	Image;
use Illuminate\Http\File as LaravelFile;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Video extends Model implements AuditableContract
{
	use Auditable;
	protected $auditTimestamps = true;
  protected $fillable = ['url','source','title','description','date','data','thumbnail','start_at','order'];

  public function news(){
    return $this->hasOne('Dataview\IONews\News');
  }

  public function getSourceId(){
    $_data = json_decode($this->data);
    return $_data->id;
	}

  public function getEmbedPlayer($autoplay=0,$w=640,$h=480){
    $_data = json_decode($this->data);
    if($this->source == 'youtube'){
      $embed = $_data->embed.('&autoplay='.$autoplay);
      return "<iframe data-start-at = '".($this->start_at)."' id = '".($_data->id)."' data-source = '".($_data->source)."' class='pswp__video' width='$w' height='$h'"
      ."src=\"$embed\" frameborder='0' allow='autoplay' allowfullscreen></iframe>";
    }

    if($this->source == 'facebook'){
      return "<div class='vplayer fb-video facebook-responsive pswp__video'
      id = '".($_data->id)."' data-start-at = '".($this->start_at)."' data-source = '".($_data->source)."' data-href=\"".($this->url)."\" data-allowfullscreen='true'></div>";
    }
  }

  public function getThumbURL(){
    $_thumb = json_decode($this->thumbnail);
     return $_thumb->url; 
  }



  public static function getSlimVideos($category=null,$offset=0,$limit=null){  
		$videos = Video::select('id','url','source','title','thumbnail','start_at','data')
    ->orderBy('date','desc');

    if(is_integer($offset))
    $videos = $videos->offset($offset)->limit($limit ? $limit : 8);

      return $videos->get();
  }
  
  
}
