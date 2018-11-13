<div class = 'row'>
  <div class="col-sm-6 col-cx-12 pl-1">
    <div class = 'row'>
      <div class="col-12">
        <div class="form-group">
          <label for = 'name' class="bmd-label-floating __required">Nome/Título do popup</label>
          <input name = 'name' type = 'text' class = 'form-control form-control-lg' />
        </div>
      </div>
    </div>
    <div class = 'row'>
      <div class="col-12">
        <div class="form-group">
          <label for = 'url' class="bmd-label-floating d-flex w-100">
            URL
          </label>
          <input name = 'url' type = 'text' class = 'form-control form-control-lg' />
        </div>
      </div>
    </div>
    <div class = 'row'>
      <div class="col-sm-3 col-xs-12">
        <div class="form-group">
          <label for = 'date_start' class="bmd-label-floating __required">Exibir em</label>
          <input name = 'date_start' id = 'date_start' type = 'text' 
          class = 'form-control datepicker form-control-lg' />
        </div>
      </div>
      <div class="col-sm-3 col-xs-12">
        <div class="form-group">
          <label for = 'date_end' class="bmd-label-floating">Exibir até</label>
          <input name = 'date_end' id = 'date_end' type = 'text' 
          class = 'form-control datepicker form-control-lg' />
        </div>
      </div>
      <div class="col-sm-3 col-xs-12">
        <div class="form-group">
          <label for = 'open_delay' class="bmd-label-floating">Abrir em (seg)</label>
          <input name = 'open_delay' id = 'open_delay' type = 'text' maxlength="4" min='1' max = '9999' onkeypress='return event.charCode >= 48 && event.charCode <= 57'
          class = 'form-control form-control-lg' />
        </div>
      </div>
      <div class="col-sm-3 col-xs-12 pr-3">
        <div class="form-group">
          <label for = 'close_delay' class="bmd-label-floating">Fechar em (seg)</label>
          <input name = 'close_delay' id = 'close_delay' type = 'text' maxlength="4" min='1' max = '9999' onkeypress='return event.charCode >= 48 && event.charCode <= 57' class = 'form-control form-control-lg' />
        </div>
      </div>
    </div>
    <div class = 'row'>
      <div class="col-sm-3 col-xs-12">
        <div class="form-group">
          <label for = 'width' class="bmd-label-static">Largura (px)</label>
          <input name = 'width' placeholder = 'auto' id = 'width' type = 'text' maxlength="4" min='1' max = '2000' onkeypress='return event.charCode >= 48 && event.charCode <= 57'
          class = 'form-control form-control-lg' />
        </div>
      </div>
      <div class="col-3 col-xs-12">
        <div class="form-group">
          <label for = 'height' class="bmd-label-static">Altura (px)</label>
          <input name = 'height' placeholder = 'auto' id = 'height' type = 'text' 
          class = 'form-control form-control-lg' maxlength="4" min='1' max = '2000' onkeypress='return event.charCode >= 48 && event.charCode <= 57' />
        </div>
      </div>
      <div class="col-5 col-xs-12">
        <div class="form-group h-100">
          <div class = 'd-flex mt-4 pt-3'>
          <label for = 'close_on_esc' class = 'bmd-label-static float-left'>Fechar com ESC?</label>
            <button type="button" class="float-left btn btn-lg aanjulena-btn-toggle btn-sm"
            data-toggle="button" aria-pressed="false" data-default-state='true'
            autocomplete="off" name = 'close_on_esc' id = 'close_on_esc'>
              <div class="handle"></div>
            </button>
            <input type = 'hidden' name = '__close_on_esc' id = '__close_on_esc' value='true'/>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-sm-6 col-xs-12">
    @include("IntranetOne::io.forms.form-images")
  </div>
</div>

