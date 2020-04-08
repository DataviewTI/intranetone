<div class="wizard mb-0" data-initialize="wizard" id="{{$_id}}">
	<div class="d-flex d-flex justify-content-between steps-container">
    <ul class="steps">
      @foreach($_steps as $s)
        <li data-step="{{$loop->iteration}}" class = "{{ slug($s['name']) }}-step @if($loop->first) active @endif">
          <span class = 'd-flex align-itens-center'>
            <span class="badge my-auto mr-1 badge-secondary">{{$loop->iteration}}</span> {{ $s['name'] }}</span>
            <span class="chevron"></span>
        </li>
      @endforeach
    </ul>
    <div class="d-flex actions">
      <button type="button" class="btn btn-secondary btn-prev rounded-0">
        <i class="ico ico-arrow-left mr-2"></i>
      </button>
      <button type="button" class="btn btn-secondary btn-next rounded-0" data-next="" data-last="">
        <i class="ico ico-arrow-right ml-2"></i>
      </button>
    </div> 
  </div>

	<div class="step-content pt-0 mb-1 pb-0" style = "@if(isset($_min_height)) min-height:{{ $_min_height }} @endif">
		@foreach($_steps as $s)
			<div class="{{ slug($s['name'], '-') }}-step-content mt-2 container-fluid mb-0 step-pane @if($loop->first) active @endif " data-step="{{ $loop->iteration}}">
				@include($s['view'],isset($s['params']) ? $s['params'] : [])
			</div>
		@endforeach
	</div>
</div>
