@php
  use Illuminate\Support\Str;
@endphp

<table class="table table-striped table-bordered hover  @if(isset($_class)) {{ $_class }} @endif" cellspacing="0" width="100%" id="{{$_id}}">
	<thead>
		@foreach($_columns as $col)
			<th class = "__dt_{{Str::slug($col['title'])}}">{!! $col['title'] !!}</th>
		@endforeach
	</thead>
</table>
