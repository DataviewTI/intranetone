<figure class = 'main-image m-0 w-100 px-2' data-index="1" itemprop="associatedMedia" itemscope itemtype="http://schema.org/ImageObject">
<a style = 'background:transparent url({{$video->getThumbUrl()}}); background-size:100% auto' class = 'd-flex align-items-center justify-content-center m-0 h-100 video-effect' href="#" itemprop="contentUrl" data-size="{{$__sizes[$big]->w}}x{{$__sizes[$big]->h}}" data-type="video" data-video='<div class="wrapper h-100 d-flex"><div class="video-wrapper v-{{$video->source}} m-auto d-flex">{{$video->getEmbedPlayer(1)}}</div></div>'>
  <img class = 'img-fluid d-none' src="{{$video->getThumbUrl()}}">
</a>
</figure>