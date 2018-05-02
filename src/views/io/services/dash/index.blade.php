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
  <div class = 'b-red'>
    @include('IntranetOne::io.services.dash.content');
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
