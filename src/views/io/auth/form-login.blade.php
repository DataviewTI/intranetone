<form action="{{ route('signin') }}" method="post" id="login_form" autocomplete="off">
  <div class="form-group">
    <label for="email" class="bmd-label-floating">Email</label>
    <input autocomplete="off" type="email" class="form-control form-control-lg" id="email" name = 'email'>
  </div>
  <div class="form-group bmd-form-group">
    <label for="password" class="bmd-label-floating">Senha</label>
    <input autocomplete="new-password" type="password" class="form-control form-control-lg" id="password" name = 'password'>
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
   <a href = '#' class = 'float-right'>esqueci minha senha</a>
  
  </p>
</form>

