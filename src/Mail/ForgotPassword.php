<?php

namespace Dataview\IntranetOne\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class ForgotPassword extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('IntranetOne::io.auth.password.mail.password-request')
                    ->from('suporte@dataview.com.br', 'IntranetOne Dataview')
                    ->subject('Redefinição de senha')
                    ->with(['data' => $this->data]);
    }
}
