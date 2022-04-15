<?php
namespace Dataview\IntranetOne;
// use App\Http\Controllers\Controller;

use Cartalyst\Sentinel\Checkpoints\NotActivatedException;
use Cartalyst\Sentinel\Checkpoints\ThrottlingException;
// use Cartalyst\Sentinel\Laravel\Facades\Activation;
use Illuminate\Http\Request;
use Illuminate\Support\MessageBag;
use Illuminate\Support\Facades\Redirect;
// use Lang;
use Mail;
use Reminder;
use Sentinel;
// use URL;
use Validator;
// use View;
use Dataview\IntranetOne\Mail\ForgotPassword as ForgotPassword;

class AuthController
{
		protected $messageBag = null;
		
		public function __construct(){
			$this->messageBag = new MessageBag;

    }
    
		public function teste(){
      dump(Sentinel::check());
      echo "S";
    }
    
		public function index(){
			if(Sentinel::check())
        return Sentinel::check(); //CHANGE to set first Service
			else
				return "...erro";
		}

    
		public function edit($userId, $token){
      return view('IntranetOne::io.auth.password.edit', ['userId' => $userId, 'token' => $token]);
		}
    
        public function getLogout(){
      if(Sentinel::getUser())
        Sentinel::logout();
      return redirect('admin/signin')->with('success', 'Usuário desconectado!');
    }

		public function getSignin(){
      if(Sentinel::check()){
        return Redirect::route('admin.dashboard');
      }
      else{
        return view('IntranetOne::io.auth.index');
      }
    }

    public function postSignin(Request $request)
    {
      try
      {
        if (Sentinel::authenticate($request->only(['email', 'password']), $request->get('remember-me', false))){
          return json_encode(['status'=>true,'message_bag'=>route("admin.dashboard")]);//deve ser o alias
        }
        $this->messageBag->add('email','Email e/ou senha não conferem!');

      }
      catch (NotActivatedException $e)
      {
        $this->messageBag->add('notActivated','Esta conta não está ativada. Verifique seu email pelo link de ativação');
      }
      catch (ThrottlingException $e)
      {
        $delay = $e->getDelay();
        $this->messageBag->add('accountSuspended','Conta suspensa temporariamente');
      }
      return json_encode(['status'=>false,'message_bag'=>$this->messageBag]);
	  }

		public function showPasswordRequestForm()
    {
        return view('IntranetOne::io.auth.password.request');
    }

    public function sendPasswordResetEmail(Request $request)
    {
        $rules = ['email' => 'required|email'];
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails())
          return json_encode(['status'=>false,'message_bag'=>$validator->errors()->all()]);
        else{
          try {
            $user = Sentinel::findByCredentials(['email' => $request->get('email')]);
            if (!$user) {
              return json_encode(['status'=>false,'message_bag'=>['O email informado não está cadastrado']]);
            }
  
            // $activation = Activation::completed($user);
            // if(!$activation)
            // 	return json_encode(['status'=>false,'message_bag'=>'usuário não ativado!']);
  
            $reminder = Reminder::exists($user) ?: Reminder::create($user);
            $mailData = ['user' => $user,'passwordResetUrl' => route('password.edit', [$user->id, $reminder->code])];
            Mail::to($user)->send(new ForgotPassword($mailData));
  
          } catch (UserNotFoundException $e) {
            // Even though the email was not found, we will pretend
            // we have sent the password reset code through email,
            // this is a security measure against hackers.
          }
  
          return json_encode(['status'=>true,'message_bag'=>['Um email de redefinição de senha foi enviado para '.$request->get('email')]]);
        }
    }

    public function passwordReset(Request $request){
        $rules = ['password'=>'required|between:3,32','confirm_password' => 'required|same:password'];
        $inputs = $request->all();
        $validator = Validator::make($inputs, $rules);

        if($validator->fails())
          return json_encode(['status'=>false,'message_bag'=>$validator->errors()->all()]);

        $user = Sentinel::findById($inputs['userId']);
        if(!$reminder = Reminder::complete($user, $inputs['token'], $request->get('password')))
						return json_encode(['status'=>false,'message_bag'=>['Não foi possível completar a operação. Faça uma nova solicitação de redefinição de senha']]);

				return json_encode(['status'=>true,'message_bag'=>["Senha redefinida com sucesso!"]]);
		}
}