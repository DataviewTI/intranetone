<?php
namespace Dataview\IntranetOne;
use App\Http\Controllers\Controller;

use Cartalyst\Sentinel\Checkpoints\NotActivatedException;
use Cartalyst\Sentinel\Checkpoints\ThrottlingException;
use Cartalyst\Sentinel\Laravel\Facades\Activation;
use Illuminate\Http\Request;
use Illuminate\Support\MessageBag;
use Illuminate\Support\Facades\Redirect;
use Lang;
use Mail;
use Reminder;
use Sentinel;
use URL;
use Validator;
use View;

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
				return "porra";
		}

    public function getLogout(){
        Sentinel::logout();
          return redirect('admin/signin')->with('success', 'Usuário desconectado!');
    }

		public function getSignin(){
      if(Sentinel::check())
        return Redirect::route('admin.dashboard');
      else
        return view('IntranetOne::io.auth.index');
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
        $this->messageBag->add('Conta não ativada');
      }
      catch (ThrottlingException $e)
      {
        $delay = $e->getDelay();
        $this->messageBag->add('Conta suspensa temporariamente');
      }
      return json_encode(['status'=>false,'message_bag'=>$this->messageBag]);
	}

		
    public function postForgotPassword(Request $request)
    {
        $rules = ['email' => 'required|email'];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails())
						return json_encode(['status'=>false,'message_bag'=>$this->messageBag]);

        try {
					$user = Sentinel::findByCredentials(['email' => $request->get('email')]);
					if (!$user) {
						return json_encode(['status'=>false,'message_bag'=>'usuário não encontrado!']);
					}

					$activation = Activation::completed($user);
					if(!$activation)
						return json_encode(['status'=>false,'message_bag'=>'usuário não ativado!']);

					$reminder = Reminder::exists($user) ?: Reminder::create($user);

					$data = ['user' => $user,'forgotPasswordUrl' => URL::route('admin-forgot-password-confirm', [$user->id, $reminder->code])];

					Mail::send('emails.forgot-password', $data, function ($m) use ($user) {
							$m->to($user->email, $user->first_name . ' ' . $user->last_name);
							$m->subject('Redefinir minha senha');
					});
        } catch (UserNotFoundException $e) {
            // Even though the email was not found, we will pretend
            // we have sent the password reset code through email,
            // this is a security measure against hackers.
        }

        //  Redirect to the forgot password
				return json_encode(['status'=>true,'message_bag'=>'email enviado com sucesso!']);
    }

    public function getForgotPasswordConfirm($userId,$passwordResetCode = null)
    {
			if(!$user = Sentinel::findById($userId))
					return Redirect::route('forgot-password')->with('error',"Email não encontrado em nossa base de dados!");

			if($reminder = Reminder::exists($user)){
					if($passwordResetCode == $reminder->code)
							return view('IntranetOne::io.auth.forgot-password-confirm');
					else
							return 'code does not match';
			}
			else
					return 'does not exists';
    }


    public function postForgotPasswordConfirm(Request $request, $userId, $passwordResetCode = null){
        $rules = ['password'=>'required|between:3,32','password_confirm' => 'required|same:password'];
        $validator = Validator::make($request->all(), $rules);

        if($validator->fails())
						return json_encode(['status'=>false,'message_bag'=>$validator]);

				$user = Sentinel::findById($userId);
        if(!$reminder = Reminder::complete($user, $passwordResetCode, $request->get('password')))
						return json_encode(['status'=>false,'message_bag'=>Lang::get('auth/message.forgot-password-confirm.error')]);
	
				return json_encode(['status'=>true,'message_bag'=>"Senha redefinida com sucesso, efetue o login!"]);
		}
}