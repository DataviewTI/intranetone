@php
  use Dataview\IntranetOne\IntranetOneController;
@endphp

@extends('IntranetOne::io.layout.dashboard')

{{-- page level styles --}}
@section('header_styles')
</style>
@stop

@section('main-content')
	<!--section ends-->
  <div class = 'h-100'>
    @include('IntranetOne::io.services.config.content')
  </div>
	<!-- content -->
  @stop
@section('footer_scripts')
@stop
