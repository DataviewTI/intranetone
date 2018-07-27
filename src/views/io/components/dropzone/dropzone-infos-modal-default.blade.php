<div class="modal fade" tabindex="-1" id = 'edit-modal' role="dialog" aria-labelledby="EditModal" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title"><i class = 'ico ico-image'></i> Detalhar Informações da Imagem</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span class = 'ico ico-close' aria-hidden="true"></span>
        </button>
      </div>
      <div class="modal-body">
        <div class = 'row'>
          <div class = 'col-5 col-xs-12'>
            <div class = 'thumbnail'>
              <img class = 'img-fluid w-100' dz-info-modal = 'img'/>
            </div>
          </div>
          <div class = 'col-7 col-xs-12'>
            <div class="form-group">
              <label for = 'dz-info-caption' class="bmd-label-floating">Titulo da Foto</label>
              <input id = 'dz-info-caption' type ='text' class = 'form-control form-control-lg'>
            </div>
            <div class="form-group">
              <label for = 'dz-info-date' class="bmd-label-floating">Data da Foto</label>
              <input id = 'dz-info-date' type ='text' class = 'form-control form-control-lg datapicker' >
            </div>
          </div>
        </div>
        <div class = 'row'>
          <div class = 'col-sm-12'>
            <label for = 'dz-info-caption' class="bmd-label-static">Outras Informações</label>
            <textarea id = 'dz-info-details' class = 'form-control form-control-lg' style = 'height:80px'></textarea>
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
