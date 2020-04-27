@php
    $prefix = "cat_";
@endphp
<div class = 'row'>
  <div class="col-xs-12 col-sm-7">
      @include('IntranetOne::io.services.categories.table-list')
  </div>
  <div class="col-xs-12 col-sm-5">
    <div class = 'row'>
      <div class="col-12 slim-select-container">
        <div class="form-group">
          <label for = '{{$prefix}}service_id' class="bmd-label-floating __required mb-3">
            Serviço
          </label>
          <select id="{{$prefix}}service_id" name = "{{$prefix}}service_id">
          </select>          
          <input type = 'hidden' name = '{{$prefix}}__service_id' id = '{{$prefix}}__service_id' />
        </div>
      </div>
    </div>
    <div class = 'row'>
      <div class="col-12 slim-select-container">
        <div class="form-group">
          <label for = '{{$prefix}}category_id' class="bmd-label-floating __required mb-3">
            Categoria Pai
          </label>
          <select id="{{$prefix}}category_id" name = "{{$prefix}}category_id">
          </select>          
        </div>
      </div>
    </div>
    <div class = 'row'>
      <div class="col-sm-8 col-xs-12">
        <div class="form-group">
          <label for='{{$prefix}}category'>Nome da Categoria/Subcategoria</label>
          <input type="text" id='{{$prefix}}category' name='{{$prefix}}category' class = 'form-control input-lg'/>
        </div>
      </div>

      <div class="col-sm-4 col-xs-12">
        <div class="form-group">
          <label for = '{{$prefix}}erasable' class="bmd-label-floating __required">Permanente</label>
          <br>
          <div class="text-center mt-3 aanjulena-container">
            <span class="my-auto mt-2 aanjulena-no">Não</span>
            <button type="button" class="btn btn-sm aanjulena-btn-toggle active"
                data-toggle="button" aria-pressed="true" 
                data-default-state='false' autocomplete="off" name = '{{$prefix}}erasable' id = '{{$prefix}}erasable'
                >
              <div class="handle"></div>
            </button>
            <span class="my-auto mt-2 aanjulena-yes">Sim</span>
            <input type = 'hidden' name = '{{$prefix}}__erasable' id = '{{$prefix}}__erasable' />
          </div>
        </div>
      </div>
    </div>  

    <div class = 'row'>
      <div class="col-12">
        <div class="form-group">
          <label for='{{$prefix}}config'>Configurações (json format)</label>
          <textarea id='{{$prefix}}config'name='{{$prefix}}config' class='form-control input-lg' style="height:80px"></textarea>
        </div>
      </div>
    </div>

  </div>
</div>