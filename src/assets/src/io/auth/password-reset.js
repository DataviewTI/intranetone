$(document).ready(function () {

    $('#email').focus();

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
        "timeOut": "10000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear", 
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    let requestForm = document.getElementById('request_form');
    let editForm = document.getElementById('edit_form');

    if(requestForm != null){
        let pswdRequestFv = FormValidation.formValidation(
            requestForm,
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
            
            let $form = $(requestForm);
    
            $.ajax(
            {
                url:$form.prop('action'),
                method:"POST",
                type:'POST',
                dataType: "json",
                data:$form.serializeArray(),
                headers: {'X-CSRF-Token': laravel_token},
                async: true,
                beforeSend: function(){
                  HoldOn.open({message:"Enviando email, aguarde...",theme:'sk-bounce'});
                },
                success: function(data)
                {
                    HoldOn.close();
    
                    if(data.status)
                    {
                        toastr["success"](data.message_bag[0]);
                    }
                    else
                    {
                        data.message_bag.forEach(function f(element, index, array) {
                            toastr["error"](data.message_bag[index]);
                        });
                    }
                }
            });
        });
    }

    if(editForm != null){
        let pswdEditFv = FormValidation.formValidation(
            editForm,
            {
                fields: {
                    password:{
                      validators:{
                        notEmpty:{
                          message: 'A senha é obrigatória'
                        },
                      }
                    },
                    confirm_password:{
                      validators:{
                        identical: {
                          compare: function() {
                            return editForm.querySelector('[name="password"]').value;
                          },
                          message: 'A senha e a confirmação de senha devem ser iguais'
                        }
                      }
                    },
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
            
            let $form = $(editForm);
    
            $.ajax(
            {
                url:$form.prop('action'),
                method:"POST",
                type:'POST',
                dataType: "json",
                data:$form.serializeArray(),
                headers: {'X-CSRF-Token': laravel_token},
                async: true,
                beforeSend: function(){
                  HoldOn.open({message:"Redefinindo senha, aguarde...",theme:'sk-bounce'});
                },
                success: function(data)
                {
                    HoldOn.close();
    
                    if(data.status)
                    {
                        toastr["success"](data.message_bag[0]);
                        setTimeout(() => {
                            window.location.href = '/admin';
                        }, 3000);
                    }
                    else
                    {
                        data.message_bag.forEach(function f(element, index, array) {
                            toastr["error"](data.message_bag[index]);
                        });
                    }
                }
            });
        });

    }

});