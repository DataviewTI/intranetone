'use strict';
$(document).ready(function () {

	$('#email').focus();

  //criar helper para inicializações e constantes
  swal.setDefaults({allowOutsideClick:false,allowEscapeKey:false,customClass:'sweet-custom',  confirmButtonColor:'#5cb85c',
  cancelButtonColor:'#d9534f'});
  
  toastr.options.preventDuplicates=true;
  toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "3000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }

  let form = document.getElementById('login_form');
  let loginFv = FormValidation.formValidation(
	  form,
	  {
		  fields: {
			  email: {
				  validators: {
					  notEmpty: {
						  message: 'O Email é obrigatório'
					  },
					  email: {
						  message: 'informe um endereço de email válido'
					  }
				  }
			  },
			  password: {
				  validators: {
					  notEmpty: {
						  message: 'A senha é obrigatória'
					  }
				  }
			  }
		  },
		  plugins: {
			  trigger: new FormValidation.plugins.Trigger(),
			  submitButton: new FormValidation.plugins.SubmitButton(),
			  bootstrap: new FormValidation.plugins.Bootstrap(),
			  icon: new FormValidation.plugins.Icon({
				  valid: 'fv-ico ico-check',
				  invalid: 'fv-ico ico-close',
				  validating: 'fv-ico ico-gear ico-spin' 
			  }),
		  },
  })
  .setLocale('pt_BR', FormValidation.locales.pt_BR)
  .on('core.form.valid', function(e){
	  let $form = $(form);

	  $.ajax(
	  {
		  url:$form.prop('action'),
		  method:"POST",
		  type:'POST',
		  dataType: "json",
		  data:$form.serializeArray(),
		  headers: {'X-CSRF-Token': laravel_token},
		  async: true,
		  success: function(data)
		  {
			  if(data.status)
			  {
				  document.location.replace(data.message_bag);
			  }
			  else
			  {
				  $($form.find('#password').val(''));
				  
				  for(data.mb in data.message_bag)
					  toastr["error"](data.message_bag[data.mb]);
			  }
		  }
	  });
  });

  // FormValidation.formValidation(
  // 	document.getElementById('reset_pw'),
  // 	{
  // 		fields: {
  // 			email: {
  // 				validators: {
  // 					notEmpty: {
  // 						message: 'Informe seu email de cadastro'
  // 					},
  // 					email: {
  // 						message: 'O email informado não é válido'
  // 					}
  // 				}
  // 			}
  // 		},
  // 		plugins: {
  // 			trigger: new FormValidation.plugins.Trigger(),
  // 			submitButton: new FormValidation.plugins.SubmitButton(),
  // 			bootstrap: new FormValidation.plugins.Bootstrap(),
  // 			icon: new FormValidation.plugins.Icon({
  // 				valid: 'material-icons valid-icon',
  // 				invalid: 'material-icons invalid-icon',
  // 				validating: 'material-icons validating-icon' 
  // 			}),
  // 		},
  // 	})
  // .setLocale('pt_BR', FormValidation.locales.pt_BR)
  // .on('success.form.fv', function(e){
  // 	e.preventDefault();
  // 	let $form = $(e.target);
  // 	let bv    = $form.data('formValidation'); // FormValidation instance

  // 	$.ajax(
  // 	{
  // 		url:$form.prop('action'),
  // 		method:"POST",
  // 		type:'POST',
  // 		dataType: "json",
  // 		data:$form.serializeArray(),
  // 		headers: {'X-CSRF-Token': laravel_token},
  // 		async: true,
  // 		beforeSend: function()
  // 		{
  // 			HoldOn.open({message:"verificando email, aguarde...",theme:'sk-bounce'});
  // 		},
  // 		success: function(data)
  // 		{
  // 			HoldOn.close();
  // 			if(data.status)
  // 			{
  // 				swal({
  // 					title:"Redefinir Senha",
  // 					text:"Um email com o link para a redefinição da senha foi enviado para <strong style = 'color:#181880'>"+$form.find('#email').val()+"</strong>",
  // 					type:"success",
  // 					onClose:function()
  // 					{
  // 						window.history.back();
  // 					}
  // 				});
  // 			}
  // 			else
  // 			{
  // 				swal({
  // 					title:"Redefinir Senha",
  // 					text:"Não existe nenhum conta para o email informado!",
  // 					type:"error",
  // 					onClose:function()
  // 					{
  // 					}
  // 				});
  // 			}
  // 		}
  // 	});
  // });

});