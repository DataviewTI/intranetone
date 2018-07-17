@php
  use Dataview\IntranetOne\IntranetOneController;
  $__service = \DB::table('services')
  ->select('service','ico','alias','description')
  ->where('alias',request()->segment(count(request()->segments())))->get()->first();
@endphp

<!DOCTYPE html>
<html lang='pt-br'>
@php
    
    session_start();
    if (Sentinel::check())
    {   
      $_SESSION['isLoggedIn'] = true;
        //deixa toda a intranet config disponível
         echo "<script>"
              ."window.IntranetOne = ".json_encode(Config::get('intranetone'))
              ."</script>";
    }
    else
    {
        echo "<script>"
              ."window.IntranetOne = null"
              ."</script>";
        ;
        $_SESSION['isLoggedIn'] = false;
    }
@endphp


<head>
  @component('IntranetOne::base.components.google-font-loader',
    ['fonts'=>
      [
        'Oswald:400,500'
      ]
    ])
  @endcomponent
  <!-- Required meta tags for elektron-->
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>   
        @section('title') {{config('intranetone.client.name')}} | {{ $__service->service}} @endsection @yield('title')
    </title>
    <!-- global css -->
    <link rel="stylesheet" type="text/css" href="{{ asset('css/bootstrap.min.css') }}" />
    <link rel="stylesheet" type="text/css" href="{{ asset('io/css/fuelux-compiled.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('io/css/io-dashboard.min.css') }}"/>
    <link rel="stylesheet" type="text/css" href="{{ asset('io/css/io-form-validation.min.css') }}" />

    <!--page level css-->
    @yield('header_styles')
    <!--end of page level css-->

<body class="fuelux app-is-fixed">
  @yield('after_body_scripts')
  <!-- BEGIN .app -->
  <div class="app">

    <!-- BEGIN .app-wrap -->
    <div class="app-wrap">

      <!-- BEGIN .app-heading -->
      <header class="row container-fluid no-gutters app-heading justify-content-between">
          <div class = 'col-6 d-flex align-self-center'>
            <div class = 'onofft-container'>
              <a class="onoffcanvas-toggler align-self-center is-animated" 
              href="#app-side" data-toggle="onoffcanvas"></a>
            </div>
            <div class = 'app-infos'>
              <h1>{{config('intranetone.client.name')}}</h1>
            </div>
          </div>
          <div class = 'col-6 align-self-center text-right'>
            @include('IntranetOne::io.layout.user-infos')
          </div>
      </header>
      <!-- END:  .app-heading -->

      <!-- BEGIN .app-container -->
      <div class="app-container">

        <!-- BEGIN .app-side is-hoverable aria-expanded=false -->
        <aside class="onoffcanvas app-side is-left" id="app-side">

          <!-- BEGIN .side-heading -->
          <div class="side-heading">
						@include('IntranetOne::io.layout.side-heading')
          </div>
          <!-- END: .side-heading -->

          <!-- BEGIN .side-content -->
          <div class="side-content">
            <!-- BEGIN .side-nav -->
            <nav class="side-nav">
              <div class = 'd-flex' style = 'height:100px'>
                <a href = '/admin/dash' class = 'd-flex h-100'>
                  <img src = "{{asset('/io/images/logo-intranet.png')}}" class = 'img-fluid d-flex m-auto'/>
                </a>
              </div>
              <!-- BEGIN: side-nav-content -->
								@include('IntranetOne::io.layout.menu')
              <!-- END: side-nav-content -->
            </nav>
            <!-- END: .side-nav -->
          </div>
          <!-- END: .side-content -->

          <!-- BEGIN .side-footer -->
          <footer class="side-footer">
						@include('IntranetOne::io.layout.side-footer')
          </footer>
          <!-- END .side-footer -->

        </aside>
        <!-- END: .app-side -->

        <!-- BEGIN .app-main -->
        <div class="app-main">

          <!-- BEGIN .main-heading -->
          <header class="main-heading">
						<h1 class = 'text-default'><i class = 'ico {{$__service->ico}}'></i> {{$__service->service}} - {{$__service->description}} @yield('main-heading')</h1>
          </header>
          <!-- END: .main-heading -->

          <!-- BEGIN .main-content -->
					<div class="main-content">  
						@yield('main-content')
					</div>
          <!-- END: .main-content -->

          <!-- BEGIN .main-footer -->
          <footer class="main-footer">
						@yield('main-footer')
          </footer>
          <!-- END: .main-footer -->

        </div>
        <!-- END: .app-main -->

      </div>
      <!-- END: .app-container -->

      <!-- begin .app-footer -->
      <footer class="app-footer">
				@include('IntranetOne::io.layout.app-footer')
      </footer>
      <!-- END: .app-footer -->

    </div>
    <!-- END: .app-wrap -->

  </div>
  <!-- END: .app -->
</div>

  <!-- global js -->
	<script type = 'text/javascript'>var laravel_token = '{{ csrf_token() }}';</script>
  <script type = 'text/javascript' src="{{ asset('js/jquery.min.js') }}"></script>
	<script type = 'text/javascript' src="{{ asset('js/popper.min.js') }}"></script>
	<script type = 'text/javascript' src="{{ asset('js/bootstrap.min.js') }}"></script>
  <script type = "text/javascript" src="{{ asset('io/js/fuelux-compiled.min.js') }}"></script>
  <script type="text/javascript" src="{{ asset('io/js/io-babel-dashboard.min.js') }}"></script>
  <script type="text/javascript" assync defer src="{{ asset('io/js/io-dashboard.min.js') }}"></script>
	<script type = 'text/javascript' src="{{ asset('io/js/io-form-validation.min.js') }}"></script>
  <script>$(document).ready(function(){
    //$('body').bootstrapMaterialDesign();
    OnoffCanvas.autoinit(true);
  });</script>


<!-- end of global js -->
<!-- begin page level js -->
@yield('footer_scripts')
<!-- end page level js -->
</body>
</html>
