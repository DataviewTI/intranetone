<ul class="nav nav-tabs d-flex justify-content-start" role="tablist"  id = '{{$_id}}'>
	@foreach($_tabs as $t)
			<li class = "nav-item">
          <a class = "nav-link @if($loop->index == $_active){{'active'}}@endif" href="#{{'tab'.$loop->iteration}}" aria-controls="{{'tab'.$loop->iteration}}" role="tab" data-toggle="tab" __name = "{{str_slug($t['tab'])}}" __update='false'>
            <i class="{{ $t['icon'] }}"></i> {{ $t['tab'] }}</a>
      </li>
		@endforeach
    <li class = 'ml-auto p-0 mr-0 my-auto'>
      <button data-toggle='tooltip' data-placement='left' title='cadastrar um novo registro' type="button" class="btn btn-success btn-new btn-sm">
        <i class="ico ico-new"></i> Novo Registro
      </button>
      <button type="button" class="btn-info-edit btn btn-sm btn-warning" style = 'display:none'>
      <span class="ico ico-edit"></span> Editando o registro nº <span style = 'font-size:12px' class='badge badge-pill badge-light'></span>
      </button>
    </li>
</ul>
<!-- Tab panes -->
<div class="tab-content pt-2" id = '{{$_id}}-container'>
	@foreach($_tabs as $t)
		<div role="tabpanel" class="tab-pane @if($loop->index == $_active){{'active'}}@endif" id = "{{'tab'.$loop->iteration}}">
			@include($t['view'],isset($t['params']) ? $t['params'] : [])
		</div>
	@endforeach
</div>

