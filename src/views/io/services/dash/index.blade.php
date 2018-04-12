@php
  use Dataview\IntranetOne\IntranetOneController;
@endphp

@extends('IntranetOne::io.layout.dashboard')

@section('title')
 @parent | IntranetOne Dashboard
@stop


{{-- page level styles --}}
@section('header_styles')
</style>
@stop

@section('main-heading')
	<h1>Dashboard</h1>
@stop

@section('main-content')
	<!--section ends-->
  <div class = 'b-red'>
  @php
    echo IntranetOneController::getServices();
  @endphp

  </div>
	<!-- content -->
  @stop

  @section('after_body_scripts')
    @include('IntranetOne::base.social.fb-sdk',[
        'app_id'=>config('intranetone.social_media.facebook.app_id'),
        'app_version'=>config('intranetone.social_media.facebook.app_version'),
        'app_locale'=>config('intranetone.social_media.facebook.locale')
        ])
  @endsection

@section('footer_scripts')
@include('IntranetOne::base.social.google-youtube');

@stop
