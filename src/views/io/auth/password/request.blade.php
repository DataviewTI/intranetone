@extends('IntranetOne::io.auth.password.layout.default')

@section('styles')
  <link rel="stylesheet" type="text/css" href="{{ asset('io/css/io-mix-password-reset.min.css') }}" />
@endsection

@section('form')
  <form action="{{ route('password.email') }}" method="post" id="request_form" autocomplete="off">
    <div class="form-group position-relative mt-4">
      <label for="email" class="bmd-label-floating">Informe o email cadastrado</label>
      <input autocomplete="@if(env('APP_ENV') == 'production'){{'off'}}@else{{'on'}}@endif" type="email" class="form-control form-control-lg" id="email" name = 'email'>
    </div>
    <div class = 'row justify-content-center'>
      <button type="submit" class="btn btn-raised btn-success">
        <i class = 'ico ico-check'></i> Enviar 
      </button>
    </div>
    <br />
  </form>
@endsection

@section('scripts')
  <script type = 'text/javascript' src="{{ asset('io/js/io-babel-password-reset.min.js') }}"></script>
@endsection