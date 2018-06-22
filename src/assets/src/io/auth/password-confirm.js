$(document).ready(function () {

	$('#password-confirm-form').formValidation(
	{
			locale: 'pt_BR',
			framework: 'bootstrap',
			icon: 
			{
				valid: 'glyphicon glyphicon-ok',
				invalid: 'glyphicon glyphicon-remove',
				validating: 'glyphicon glyphicon-refresh'
			},
			excluded: ':disabled', /* necessário para os combobox, why?? */
			fields:
			{
        password: {
					validators: {
						notEmpty: {
								message: 'A senha é obrigatória'
						},
						identical: {
							field: 'password_confirm',
							message: 'As senhas não conferem!'
						}
					}
        },
				password_confirm: {
					validators: {
						notEmpty: {
								message: 'A confirmação de senha é obrigatória'
						},
						identical: {
							field: 'password',
							message: 'As senhas não conferem!'
						}
					}
        }
			}
		}).on('err.field.fv', function(e, data){
			
    }).on('success.form.fv', function(e){
			e.preventDefault();
			var $form = $(e.target);
			bv    = $form.data('formValidation'); // FormValidation instance

			$.ajax(
			{
				url:$form.prop('action'),
				method:"POST",
				type:'POST',
				dataType: "json",
				data:$form.serializeArray(),
				headers: {'X-CSRF-Token': laravel_token},
				async: true,
				beforeSend: function()
				{
					HoldOn.open({message:"verificando usuário e senha, aguarde...",theme:'sk-bounce'});
				},
				success: function(data)
				{
					HoldOn.close();
					if(data.status)
					{
						swal({
							title:"Alteração de Senha",
							text:data.message_bag,
							type:"success",
							onClose:function()
							{
								document.location.replace('http://josh2/admin');
								//verificar como pegar globals JS ou mesmo PHP
							}
						});
					}
					else
					{
						swal({
							title:"Alteração de Senha",
							text:data.message_bag,
							type:"error",
							onClose:function()
							{
							}
						});
					}
				}
			});
		});
});