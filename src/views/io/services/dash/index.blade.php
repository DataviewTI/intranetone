@php
  use Dataview\IntranetOne\IntranetOneController;
@endphp

@extends('IntranetOne::io.layout.dashboard')

@section('main-content')
	<!--section ends-->
  <div class = 'h-100'>
    
  </div>
	<!-- content -->
  @stop

  @section('after_body_scripts')
    @include('IntranetOne::base.social.fb-sdk',[
        'appID'=>config('intranetone.socialMedia.facebook.appID'),
        'appVersion'=>config('intranetone.socialMedia.facebook.appVersion'),
        'appLocale'=>config('intranetone.socialMedia.facebook.locale')
        ])
  @endsection

@section('footer_scripts')
@include('IntranetOne::base.social.google-youtube');
@stop
