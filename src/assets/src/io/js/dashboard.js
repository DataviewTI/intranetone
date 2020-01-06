/*
|--------------------------------------------------------------------------
| Global JS configurations for default page
|--------------------------------------------------------------------------
*/

$ = jQuery;
var IO = { services: {}, active: null }

/* ajax default params for all requests*/
$.ajaxSetup({
  dataType: "json",
  method: 'GET',
  headers: { 'X-CSRF-Token': laravel_token },
  async: true,
});

/* jQuery Closure MutationObserver to detect attribute changes*/
$(function () {
  (function ($) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    $.fn.attrchange = function (callback) {
      if (MutationObserver) {
        var options = {
          subtree: false,
          attributes: true
        };

        var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (e) {
            callback.call(e.target, e.attributeName);
          });
        });

        return this.each(function () {
          observer.observe(this, options);
        });
      }
    }
  })(jQuery);
});

$(document).ready(function () {
  $('#app-side-hoverable-toggler').on('click', function () {
    $('.app-side').toggleClass('is-hoverable');
    $(this).children('i.ico').toggleClass('ico-arrow-right ico-arrow-left');
  });

  $(".user-infos").mouseover(function () {
    $(".app-heading .user-infos .box").css('display', 'block');
  }).mouseout(function () {
    // $( ".app-heading .user-infos .box" ).css('display', 'none');
  });

  $(".app-heading .user-infos .box").mouseover(function () {
    $(".app-heading .user-infos .box").css('display', 'block');
  }).mouseout(function () {
    $(".app-heading .user-infos .box").css('display', 'none');
  });

  $('a#edit-profile').on('click', function (e) {
    e.preventDefault();

    $('#profile-modal').find('input[name=first_name]').val(loggedUser.first_name);
    $('#profile-modal').find('input[name=last_name]').val(loggedUser.last_name);
    $('#profile-modal').find('input[name=email]').val(loggedUser.email);

    $('#profile-modal').modal('show');
  });

  $('button#save-profile').on('click', function (e) {
    e.preventDefault();
    fv.validate()
      .then(function (status) {
        if (status === 'Valid') {
          var formData = $('#edit-profile-form').serializeArray();
          self.updateProfile(formData);
        }
      });
  });

  let form = document.getElementById('edit-profile-form');
  let fv = FormValidation.formValidation(
    form,
    {
      fields: {
        first_name: {
          validators: {
            notEmpty: {
              enabled: true,
              message: 'O nome é obrigatório'
            },
          }
        },
        last_name: {
          validators: {
            notEmpty: {
              enabled: true,
              message: 'O sobrenome é obrigatório'
            },
          }
        },
        email: {
          validators: {
            notEmpty: {
              enabled: true,
              message: 'O email é obrigatória'
            },
          }
        },
        confirm_password: {
          validators: {
            identical: {
              compare: function () {
                return form.querySelector('[name="password"]').value;
              },
              message: 'A senha e a confirmação de senha devem ser iguais'
            }
          }
        },
      },
      plugins: {
        trigger: new FormValidation.plugins.Trigger(),
        submitButton: new FormValidation.plugins.SubmitButton(),
        // defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
        bootstrap: new FormValidation.plugins.Bootstrap(),
        icon: new FormValidation.plugins.Icon({
          valid: 'fv-ico ico-check',
          invalid: 'fv-ico ico-close',
          validating: 'fv-ico ico-gear ico-spin'
        }),
      },
    }).setLocale('pt_BR', FormValidation.locales.pt_BR);

}); //FIM DO READY

function updateProfile(formData) {
  $.ajax({
    url: '/admin/user/update/' + loggedUser.id,
    method: 'POST',
    data: formData,
    beforeSend: function () {
      // HoldOn.open({message:"Atualizando dados, aguarde...",theme:'sk-bounce'});
    },
    success: function (data) {
      HoldOn.close();
      if (data.success) {
        if (data.email) {
          swal({
            title: "Perfil atualizado com sucesso!",
            text: "Um email de confirmação foi enviado para " + data.email + ". Clique no link presente no email para ativar o cadastro",
            confirmButtonText: 'OK',
            type: "success",
            onClose: function () {
              // window.location.href = "/admin/logout";
              location.reload();
            }
          });
        } else {
          swal({
            title: "Perfil atualizado com sucesso!",
            confirmButtonText: 'OK',
            type: "success",
            onClose: function () {
              location.reload();
            }
          });
        }
      }
    },
    error: function (ret) {
      self.defaults.ajax.onError(ret, self.callbacks.create.onError);
    }
  });//end ajax

}
