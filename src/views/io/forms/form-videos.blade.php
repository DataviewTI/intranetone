<div class = 'row'>
  <div class="col-sm-5 col-xs-12 pl-1">
    <div class = 'row'>
      <div class="col-md-12 col-sm-12">
        <div class="form-group">
          <label for = 'video_url' class="bmd-label-floating __required">URL do Vídeo</label>
            <input name = 'video_url' id = 'video_url' type = 'text' class = 'form-control form-control-lg' />
        </div>
      </div>
    </div>
    <div class = 'row'>
      <div class="col-md-12 col-sm-12">
        <div class="form-group">
          <label for = 'video_title' class="bmd-label-floating">Título do Vídeo</label>
          <input name = 'video_title' id = 'video_title' type = 'text' class = 'form-control form-control-lg' />
        </div>
      </div>
    </div>
    <div class = 'row'>
      <div class="col-md-10 col-sm-10">
        <div class="form-group">
          <label for = 'video_description' class="bmd-label-floating">Descrição do Vídeo</label>
          <input name = 'video_description' id = 'video_description' type = 'text' class = 'form-control form-control-lg' />
        </div>
      </div>
      <div class="col-md-2 col-sm-2 d-flex align-items-center">
        <input type="hidden" name="video_id" id="video_id">
        <button id="save_video" class="btn btn-primary">Salvar</button>
      </div>
    </div>
  </div>
  <div class="col-md-5 col-sm-12">
    <div class = 'row d-flex'>
      <div class="col-md-12 col-sm-12 pl-1" id = 'embed-container-video'> 
        <div class = 'form-group d-flex w-100'>
          <div class="embed-responsive embed-responsive-16by9 embed-responsive __video facebook-responsive">
            <!--youtube-->
            <iframe class = 'vplayer d-none' id = 'youtube-player' style = 'width:100%;'
            src="" frameborder="0"  allow="autoplay" allow="encrypted-media" allowfullscreen></iframe>
            <!--facebook-->
            <!-- gera problema, usar um dnone?-->
            <div class="vplayer fb-video d-none facebook-responsive" id = 'facebook-player' data-href="" data-allowfullscreen="true"></div>
              <input class = 'form-control form-control-lg' type = 'hidden' name='imageorvideo' value='0' />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-md-2 col-sm-12">
    <div class = 'row m-0 p-0 h-100'>
        <div class="form-group h-100 col-12">
          <div class = 'row container-video-thumb d-flex justify-content-between' style=""></div>
          <input type="hidden" id="loaded-video" value="">
          <input type="hidden" id="selected-thumbnail" value="">
          <input type = 'hidden' name = 'videos_thumbnails' id = 'videos_thumbnails' />
          <input type = 'hidden' name = 'videos_data' id = 'videos_data' />
        </div>
    </div>
  </div>
</div>
<div id="video-list" class="row py-3 bg-white" style="border: 1px solid #cbcbcb; border-radius: 5px; position: relative">
  <div id="add-video" class="bg-success text-white">
    <i class = 'ico ico-plus'></i>
  </div>
</div>