@extends('IntranetOne::io.auth.password.layout.default')

@section('styles')
  <link rel="stylesheet" type="text/css" href="{{ asset('io/css/io-mix-password-reset.min.css') }}" />
@endsection

@section('form')
  <form action="{{ route('password.reset') }}" method="post" id="edit_form" autocomplete="off">
    <input type="hidden" name="token" value="{{ $token }}">
    <input type="hidden" name="userId" value="{{ $userId }}">
    <div class="form-group position-relative mt-4">
      <label for="password" class="bmd-label-floating">Digite a nova senha</label>
      <input autocomplete="@if(env('APP_ENV') == 'production'){{'off'}}@else{{'on'}}@endif" type="password" class="form-control form-control-lg" id="password" name = 'password'>
    </div>
    <div class="form-group position-relative mt-4">
      <label for="confirm_password" class="bmd-label-floating">Confirme a nova senha</label>
      <input autocomplete="@if(env('APP_ENV') == 'production'){{'off'}}@else{{'on'}}@endif" type="password" class="form-control form-control-lg" id="confirm_password" name = 'confirm_password'>
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
