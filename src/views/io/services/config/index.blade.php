@extends('IntranetOne::io.layout.dashboard')

{{-- page level styles --}}
@section('header_styles')
  <link rel="stylesheet" type="text/css" href="{{ asset('io/services/io-config.min.css') }}">
</style>
@stop

@section('main-heading')
@stop

@section('main-content')
	<!--section ends-->
			@component('IntranetOne::io.components.nav-tabs',
			[
				"_id" => "default-tablist",
				"_active"=>0,
				"_tabs"=> [
					[
						"tab"=>"Cadastrar",
						"icon"=>"ico ico-new",
						"view"=>"Popup::form"
					]
				]
			])
			@endcomponent
	<!-- content -->
  @stop

@section('footer_scripts')
<script src="{{ asset('js/pickadate-full.min.js') }}" type="text/javascript"></script>
<script src="{{ asset('io/services/io-popup-babel.min.js') }}" type="text/javascript"></script>
<script src="{{ asset('io/services/io-popup-mix.min.js') }}" type="text/javascript"></script>
<script src="{{ asset('io/services/io-popup.min.js') }}" type="text/javascript"></script>
@stop
