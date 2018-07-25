@if (session('activation'))
    <div class="alert @if(session('activation')['status']) alert-success @else alert-danger @endif">
        {{ session('activation')['message'] }}
    </div>
@endif
<form action="{{ route('signin') }}" method="post" id="login_form" autocomplete="off">
  <div class="form-group position-relative mt-4">
    <label for="email" class="bmd-label-floating">Email</label>
  <input autocomplete="@if(env('APP_ENV') == 'production'){{'off'}}@else{{'on'}}@endif" type="email" class="form-control form-control-lg" id="email" name = 'email'>
  </div>
  <div class="form-group position-relative">
    <label for="password" class="bmd-label-floating">Senha</label>
    <input autocomplete="@if(env('APP_ENV') == 'production'){{'new-password'}}@else{{'on'}}@endif" type="password" class="form-control form-control-lg" id="password" name = 'password'>
  </div>
  <br/>
  <div class="checkbox">
    <label>
      <input autocomplete="off" type="checkbox" name="remember-me" id="remember-me" value="remember-me"> Permanecer conectado
    </label>
  </div>
  <br/>
  <div class = 'row justify-content-center'>
    <button type="submit" class="btn btn-raised btn-success">
      <i class = 'ico ico-check'></i> Entrar 
    </button>
   </div>
   <br />
   <a href = "{{ route('password.request') }}" class = 'float-right'>Esqueci minha senha</a>
  
  </p>
</form>

