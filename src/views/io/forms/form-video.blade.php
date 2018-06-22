<div class = 'row'>
  <div class="col-sm-7 col-xs-12 pl-1">
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
      <div class="col-md-12 col-sm-12">
        <div class="form-group">
          <label for = 'video_description' class="bmd-label-floating">Descrição do Vídeo</label>
          <input name = 'video_description' id = 'video_description' type = 'text' class = 'form-control form-control-lg' />
        </div>
      </div>
    </div>
    <div class = 'row container m-0 p-0'>
      <div class="col-12 m-0 p-0">
        <div class="form-group">
          <div class = 'container-video-thumb d-flex justify-content-between'>
          </div>
          <input type = 'hidden' name = 'video_thumbnail' id = 'video_thumbnail' />
          <input type = 'hidden' name = 'video_data' id = 'video_data' />
        </div>
      </div>
    </div>
  </div>
  <div class="col-md-5 col-sm-12">
    <div class = 'row'>
      <div class="col-md-5 col-sm-12"> 
        <div class="form-group">
          <label for = 'video_start_at' class="bmd-label-static">Iniciar o vídem em:</label>
          <input name = 'video_start_at' id = 'video_start_at' type = 'text' 
          class = 'form-control form-control-lg' disabled/>
        </div>
      </div>
      <div class=" d-flex justify-content-start col-md-2 col-sm-12 px-0"> 
        <span class = 'dv-btn-circle dv-btn-circle-small text-white bg-danger my-auto ml-1 __disabled mouse-off' id = 'btn-get-current-time'>
          <i class = 'ico ico-clock no-transition'></i>
        </span>
      </div>
      <div class="col-md-5 col-sm-12 pr-0"> 
        <div class="form-group">
          <label for = 'video_date' class="bmd-label-floating">Data da Vídeo/Pulicação</label>
          <input name = 'video_date' id = 'video_date' type = 'text' 
          class = 'form-control datepicker form-control-lg' />
        </div>
      </div>
    </div>  
    <div class = 'row d-flex'>
      <div class="col-md-12 col-sm-12 pl-1" id = 'embed-container-video'> 
        <div class="embed-responsive embed-responsive-16by9 embed-responsive __video facebook-responsive">
          <!--youtube-->
          <iframe class = 'vplayer d-none' id = 'youtube-player' style = 'width:100%;'
           src="" frameborder="0"  allow="autoplay" allow="encrypted-media" allowfullscreen></iframe>
          <!--facebook-->
          <!-- gera problema, usar um dnone?-->
          <div class="vplayer fb-video d-none facebook-responsive" id = 'facebook-player' data-href="" data-allowfullscreen="true"></div>
          <div class = 'form-group' style = 'position:absolute; top:0'>
            <input type = 'hidden' name='imageorvideo' value='0' />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
