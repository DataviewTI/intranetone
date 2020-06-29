@php
  $_id = isset($id) ? $id : "default-info-modal";
  $_class = isset($class) ? $class : "";
@endphp


<div class="modal fade" tabindex="-1" id = "{{$_id}}" class = "{{$_class}}" role="dialog" aria-labelledby="{{$_id}}" aria-hidden="true">
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
          <div class = 'col-12 col-xs-12 d-flex'>
            <div style="border:1px #ccc solid; border-radius:3px" class="p-1">
              <div class="d-flex">
                <img dz-info-modal = 'img' class="m-auto"/>
              </div>
            </div>
            <div class="d-flex flex-fill flex-column">
              <div class="d-flex flex-fill">
                <div class="col-8 col-xs-12 form-group">
                  <label for = 'dz-info-caption' class="bmd-label-floating">Titulo da Foto</label>
                  <input id = "dz-info-caption" type ='text' class = 'dz-info-caption form-control form-control-lg'>
                </div>
                <div class="col-4 col-xs-12 form-group">
                  <label for = 'dz-info-date' class="bmd-label-floating">Data da Foto</label>
                  <input name = 'dz-info-date' type ='text' class = 'dz-info-date form-control form-control-lg datapicker' >
                </div>
              </div>
              <div class="d-flex flex-fill">
                <div class="col-12">
                  <label for = 'dz-info-details' class="bmd-label-static">Outras Informações</label>
                  <textarea name = "dz-info-details"class = 'dz-info-details form-control form-control-lg' style = 'height:80px'></textarea>
                </div>
              </div>
            </div>
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
