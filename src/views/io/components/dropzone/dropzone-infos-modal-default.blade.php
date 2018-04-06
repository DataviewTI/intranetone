<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title"><i class = 'ico ico-image'></i> Detalhar Informações da Imagem</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span class = 'ico ico-close' aria-hidden="true"></span>
        </button>
      </div>
      <div class="modal-body">
        <div class = 'row'>
          <div class = 'col-sm-5'>
            <div class = 'thumbnail'>
              <img class = 'img-fluid w-100' dz-info-modal = 'img'/>
            </div>
          </div>
          <div class = 'col-sm-7'>
            <div class="form-group">
              <label for = 'dz-info-modal-caption' class="bmd-label-floating">Titulo da Foto</label>
              <input type ='text' class = 'form-control form-control-lg' id = 'dz-info-modal-caption' dz-info-modal = 'caption'>
            </div>
            <div class="form-group">
              <label for = 'dz-info-modal-date' class="bmd-label-floating">Data da Foto</label>
              <input type ='text' class = 'form-control form-control-lg datapicker'  id = 'dz-info-modal-date' dz-info-modal='date'>
            </div>
          </div>
        </div>
        <div class = 'row'>
          <div class = 'col-sm-12'>
            <label for = 'dz-info-modal-caption' class="bmd-label-static">Outras Informações</label>
            <textarea class = 'form-control form-control-lg'  id = 'dz-info-modal-details' dz-info-modal='details' style = 'height:80px'></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer" style = 'padding:.7em 1.2em'>
        <div class = 'w-100'>
            <button type="button" class="btn btn-lg btn-danger float-left d-inline" data-dismiss="modal"><span class = 'ico ico-close'></span> Fechar</button>
            <button type="button" class="btn btn-lg btn-success float-right" dz-info-modal='btn-save'><span class = 'ico ico-save'></span> Salvar Informações</button>
        </div>
      </div>
    </div>
  </div>
</div>
