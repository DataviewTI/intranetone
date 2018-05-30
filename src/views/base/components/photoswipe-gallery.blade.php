@php
  
  $__sizes = (Array) json_decode($group->sizes)->sizes;

  $visible = isset($visible) ? $visible : 1;
  $video = isset($video) ? $video : null;

  $big = isset($big) ? $big : "big";

  if(isset($main)){
    $main["a_class"] = isset($main["a_class"]) ? $main["a_class"] : "";
    $main["figure_class"] = isset($main["figure_class"]) ? $main["figure_class"] : "";
    $main["img_class"] = isset($main["img_class"]) ? $main["img_class"] : "";
  }
  else{
    $main = [
      "a_class" => "",
      "figure_class" => "",
      "img_class" => "img-fluid w-100 m-0"
    ];
  }

  if(isset($sizes)){
    $sizes["thumb"] = isset($sizes["thumb"]) ? $sizes["thumb"] : "thumb";
    $sizes["normal"] = isset($sizes["normal"]) ? $sizes["normal"] : "thumb";
    $sizes["big"] = isset($sizes["big"]) ? $sizes["big"] : "thumb";
  }
  else{
    $sizes = [
      "thumb" => "thumb",
      "normal" => "thumb",
      "big" => "thumb",
    ];
  }
  
@endphp
<div class = "ps-gallery m-0 p-0 w-100 d-flex @if(isset($class)){{$class}}@endif" style = "@if(isset($style)){{$style}}@endif" itemscope itemtype="http://schema.org/ImageGallery" id='$id'>
  @foreach($group->files as $f)
    @if($loop->first || $loop->iteration <= $visible)
      @if($loop->first && $video !== null)
        @include('base.components.photoswipe-video',["video"=>$video,"f"=>$f,"__sizes"=>$__sizes,"big"=>$big])
      @else
      <figure data-index="{{$loop->iteration}}"
      itemprop="associatedMedia" itemscope
      itemtype="http://schema.org/ImageObject" class = "main-image m-0 {{$main['figure_class']}}">
        <a href="{{$f->getPath(['size'=>$sizes['normal']])}}" class = "{{$main['a_class']}}"
           itemprop="contentUrl" data-size="{{$__sizes[$big]->w}}x{{$__sizes[$big]->h}}">
          <img src = "{{$f->getPath(['size'=>$sizes['thumb']])}}" class = "{{$main['img_class']}}" alt = '...'/>
        </a>
        @if(!empty($f->caption))
          <figcaption itemprop="caption description" class = 'd-none'>{{$f->caption}}</figcaption>
        @endif
      </figure>
      @endif
    @else
      <figure style = 'display:none' data-index="{{$loop->iteration}}"
        itemprop="associatedMedia" itemscope itemtype="http://schema.org/ImageObject">
        <a href="{{$f->getPath(['size'=>$sizes['big']])}}" itemprop="contentUrl" data-size="{{$__sizes[$big]->w}}x{{$__sizes[$big]->h}}">
          <img src = "{{$f->getPath(['size'=>$sizes['normal']])}}" class = 'img-fluid w-100 m-0' alt = '...'/>
        </a>
        @if(!empty($f->caption))
          <figcaption itemprop="caption description">{{$f->caption}}</figcaption>
        @endif
      </figure>
    @endif
  @endforeach
</div>