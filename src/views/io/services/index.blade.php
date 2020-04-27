@php
  use Dataview\IntranetOne\IntranetOneController;
@endphp

@extends('IntranetOne::io.layout.dashboard')

@section('main-content')
	<!--section ends-->
  <div class = 'h-100'>
    @include('IntranetOne::io.services.dash.content')
  </div>
	<!-- content -->
  @stop

  @section('after_body_scripts')
    @include('IntranetOne::base.social.fb-sdk',[
        'app_id'=>config('intranetone.socialMedia.facebook.app_id'),
        'app_version'=>config('intranetone.socialMedia.facebook.app_version'),
        'app_locale'=>config('intranetone.socialMedia.facebook.locale')
        ])
  @endsection

@section('footer_scripts')
@include('IntranetOne::base.social.google-youtube');
@stop
