@php
  $prefix = isset($id) ? $id."-" : "";
  $tab = isset($tab) ? "tab='{$tab}'" : "";

@endphp

<div class = 'row'>
  <div class="col-xs-12 col-sm-8">
    <div class = 'row'>
      <div class="col-sm-2 col-xs-12 pr-0">
        <div class="form-group">
          <label for = '{{$prefix}}zipCode' class="bmd-label-floating">CEP</label>
          <input name = '{{$prefix}}zipCode' type = 'tel' id = '{{$prefix}}zipCode' {{$tab}} class = 'form-control form-control-lg' />
        </div>
      </div>
      <div class="col-sm-6 col-xs-12 pr-0">
        <div class="form-group">
          <label for = '{{$prefix}}address' class="bmd-label-floating">Logradrouro / Endereço / Nº / Complemento</label>
          <input name = '{{$prefix}}address' type = 'text' id = '{{$prefix}}address' {{$tab}} class = 'form-control form-control-lg' />
        </div>
      </div>
      <div class="col-sm-4 col-xs-12">
        <div class="form-group">
          <label for = '{{$prefix}}address2' class="bmd-label-floating">Bairro</label>
          <input name = '{{$prefix}}address2' type = 'text' id = '{{$prefix}}address2' {{$tab}} class = 'form-control form-control-lg' />
        </div>
      </div>
    </div>
  </div>
  <div class="col-xs-12 col-sm-4">
    <div class = 'row'>
      <div class="col-10">
        <div class="form-group">
          <label for = '{{$prefix}}city' class="bmd-label-floating">Cidade</label>
          <input name = '{{$prefix}}city' type = 'text' id = '{{$prefix}}city' always-send class = 'form-control form-control-lg' disabled/>
          <input name = '{{$prefix}}city_id' type = 'hidden' id = '{{$prefix}}city_id' {{$tab}} class = 'form-control form-control-lg' />
        </div>
      </div>
      <div class="col-2 pl-0">
        <div class="form-group">
          <label for = '{{$prefix}}state' class="bmd-label-floating">UF</label>
          <input name = '{{$prefix}}state' type = 'text' id = '{{$prefix}}state' {{$tab}} always-send class = 'form-control form-control-lg' disabled/>
        </div>
      </div>
    </div>
  </div>
</div>
