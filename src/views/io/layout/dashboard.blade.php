@php 
//session_start();
  use Dataview\IntranetOne\IntranetOneController;
  $__service = \DB::table('services')
  ->select('id','service','ico','alias','description')
  ->where('alias',request()->segment(count(request()->segments())))->get()->first();
@endphp

<!DOCTYPE html>
<html lang='pt-br'>
<<<<<<< HEAD
@if(Sentinel::check())
  @php
   $_SESSION['isLoggedIn'] = Sentinel::check();
   $__userConfig = optional(Dataview\IOConfig\Config::select('user_id','configuration')
   ->where('name','default')
   ->where('user_id',optional(\Sentinel::getUser())->id ?: 99999)
   ->first())->configuration ?: [];

   $_SESSION['IntranetOne'] = (Object) array_replace_recursive(config('intranetone'),
    array_filter($__userConfig,function($val){
    return $val !== '';
   }));
  @endphp
  <script>
    window.sessionStorage.setItem("IntranetOne",'@json(config("intranetone"))')
  </script>
@endif
=======
@php
    
    session_start();
    if (Sentinel::check())
    {   
      $_SESSION['isLoggedIn'] = true;
        //deixa toda a intranet config disponível
         echo "<script>"
              ."window.IntranetOne = ".json_encode(Config::get('intranetone')).";"
              ."window.loggedUser = ".json_encode(Sentinel::getUser()).";"
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


>>>>>>> 6785c1850fc6a3b5533be2a019e591fc1f44daac
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
        @section('title') {{optional($_SESSION['IntranetOne'])->systemName}} | {{ $__service->service}} @endsection @yield('title')
    </title>
    <!-- global css -->
    <link rel="stylesheet" type="text/css" href="{{ asset('css/bootstrap.min.css') }}" />
    <link rel="stylesheet" type="text/css" href="{{ asset('io/css/fuelux-compiled.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('io/css/io-dashboard.min.css') }}"/>
    <link rel="stylesheet" type="text/css" href="{{ asset('io/css/io-form-validation.min.css') }}" />

    <!--page level css-->

    @yield('header_styles')
    <!--end of page level css-->

    @if(filled(optional((Object)optional($_SESSION['IntranetOne'])->colors)->mainColor))
      <style type = 'text/css'>
        .dash-menu li a{
          color: {{optional((Object)optional($_SESSION['IntranetOne'])->colors)->mainColor}}
        }
        .app-heading{
          background-color:{{optional((Object)optional($_SESSION['IntranetOne'])->colors)->mainColor}}
        }
        .dash-menu li:hover a,
        .dash-menu li._active a{
          background-color:currentColor
        }
      </style>
    @endif
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
              <h1>{{optional($_SESSION['IntranetOne'])->systemName}}</h1>
            </div>
          </div>
          <div class = 'col-6 justify-content-end d-flex'>
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
<<<<<<< HEAD
                  <img src="{{ asset(optional($_SESSION['IntranetOne'])->logo['thumb']) }}" class = 'img-fluid d-flex m-auto'/>
=======
                  <img src = "{{asset('/io/images/logo-intranet.png')}}" class = 'img-fluid d-flex m-auto px-2'/>
>>>>>>> 6785c1850fc6a3b5533be2a019e591fc1f44daac
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

<div id="profile-modal" class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Editar perfil</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <form id="edit-profile-form">
          <div class = 'row'>
            <div class="col-6">
              <div class="form-group">
                <label for = 'first_name' class="bmd-label-floating __required">Nome</label>
                <input name = 'first_name' type = 'text' class = 'form-control form-control-lg' />
              </div>
            </div>
            <div class="col-6">
              <div class="form-group">
                <label for = 'last_name' class="bmd-label-floating __required">Sobrenome</label>
                <input name = 'last_name' type = 'text' class = 'form-control form-control-lg' />
              </div>
            </div>
          </div>
    
          <div class = 'row'>
            <div class="col-12">
              <div class="form-group">
                <label for = 'email' class="bmd-label-floating __required">Email</label>
                <input name = 'email' type = 'text' class = 'form-control form-control-lg' />
              </div>
            </div>
          </div>
    
          <div class = 'row'>
            <div class="col-6">
              <div class="form-group">
                <label for = 'password' class="bmd-label-floating __required">Senha</label>
                <input name = 'password' type = 'password' class = 'form-control form-control-lg' />
              </div>
            </div>
            <div class="col-6">
              <div class="form-group">
                <label for = 'confirm_password' class="bmd-label-floating __required">Confirme a senha</label>
                <input name = 'confirm_password' type = 'password' class = 'form-control form-control-lg' />
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button id="save-profile" type="button" class="btn btn-primary">Salvar</button>
      </div>
    </div>
  </div>
</div>

  <!-- global js -->
	<script>var laravel_token = '{{ csrf_token() }}';</script>
  <script src="{{ asset('js/jquery.min.js') }}"></script>
	<script src="{{ asset('js/popper.min.js') }}"></script>
	<script src="{{ asset('js/bootstrap.min.js') }}"></script>
  <script src="{{ asset('io/js/fuelux-compiled.min.js') }}"></script>
  <script src="{{ asset('io/js/io-babel-dashboard.min.js') }}"></script>
  <script assync defer src="{{ asset('io/js/io-dashboard.min.js') }}"></script>
	<script src="{{ asset('io/js/io-form-validation.min.js') }}"></script>
	<script src="{{ asset('io/js/io-form-validation-pt_BR.js') }}"></script>

  <script>$(document).ready(function(){
    OnoffCanvas.autoinit(true)
  });</script>


<!-- end of global js -->
<!-- begin page level js -->
@yield('footer_scripts')
<!-- end page level js -->
@yield('before_body_close')
</body>
</html>
