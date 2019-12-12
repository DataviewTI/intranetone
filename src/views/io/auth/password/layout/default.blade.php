@php
use Dataview\IOConfig\Config;
session_start();
  $_SESSION['isLoggedIn'] = Sentinel::check();

$__config = Config::select()
->where('name','default')
->with([
        'group'=>function($query){
        $query->select('groups.id','sizes')
        ->with('files');
      },
    ])
->first();

@endphp

<!DOCTYPE html>
<html lang='en'>
<head>
  @component('IntranetOne::base.components.google-font-loader',
    ['fonts'=>
      [
        'Roboto:300,400,500,700',
      ]
    ])
  @endcomponent

  <title>{{config('site.title').config('site.posfix')}} @yield('title')</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="stylesheet" type="text/css" href="{{ asset('css/bootstrap.min.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('io/css/io-form-validation.min.css') }}" />
  @yield('styles')
</head>
<body class = 'h-100'>
  <div class="container h-100">
      <div class = 'row justify-content-md-center h-100'>
        <div class = 'col-sm-12 col-md-4 align-self-center' id = 'login-box'>
          <div class = 'd-flex'>
            <img class = 'my-3 mx-auto img-fluid' src="{{ asset($__config->group->main()->getPath(['size'=>'thumb'])) }}" alt="logo intranet">
          </div>
          @yield('form')
        </div>
      </div>
  </div>

  <!-- global js -->
	<script type = 'text/javascript'>var laravel_token = '{{ csrf_token() }}';</script>
  <script type = 'text/javascript' src="{{ asset('js/jquery.min.js') }}"></script>
	<script type = 'text/javascript' src="{{ asset('js/popper.min.js') }}"></script>
	<script type = 'text/javascript' src="{{ asset('js/bootstrap.min.js') }}"></script>
	<script type = 'text/javascript' src="{{ asset('io/js/io-form-validation.min.js') }}"></script>
  @yield('scripts')
</body>
</html>