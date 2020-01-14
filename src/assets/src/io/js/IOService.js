/** default CRUD operations to all Service Classes ******************************************************/
/** Separar o DVService em outro arquivo*/
//ESSA CLASSE QUE DÁ O ERRO DO WEBPACK

class IOService {
  constructor(params, callback) {
    this.toView = null;
    this.tabs = {};
    this.defaults = { ajax: null };
    this.name = params.name;
    this.path = params.path || params.name.toLowerCase();
    this.cdt = null; //categories datatable
    this.cem = $('#categories-crud-modal'); //category edit modal
    this.createCategory = null; //service's categories
    this.updateCategory = null; //service's categories
    this.deleteCategory = null; //service's categories
    this.dt = null;
    this.fv = null;
    this.dz = null;
    // this.isUpdate = false;
    this.extraData = {};
    this.dfId = params.dfId || 'default-form';
    this.df = $('#' + this.dfId);
    this.wz = params.wz || $('#default-wizard').wizard();
    this.onNew = false;
    this.callbacks = {
      view: { onSuccess: function() {}, onError: function() {} },
      create: { onSuccess: function() {}, onError: function() {} },
      update: { onSuccess: function() {}, onError: function() {} },
      delete: { onSuccess: function() {}, onError: function() {} },
      unload: function() {}
    };

    this.override = {
      view: { onSuccess: false, onError: false },
      create: { onSuccess: false, onError: false },
      update: { onSuccess: false, onError: false },
      delete: { onSuccess: false, onError: false },
      unload: false
    };

    // const self = this;
    IO.active = this;
    IO.services[this.name.toLowerCase()] = this;

    $(document).ready(() => {
      let self = this;
      this.config = {
        default: JSON.parse(window.sessionStorage.getItem('IntranetOne')),
        user: JSON.parse(window.sessionStorage.getItem('configUser'))
      };

      $("a[data-toggle='tab'").each((i, obj) => {
        this.tabs[$(obj).attr('__name')] = {
          tab: $(obj),
          setState: function(val) {
            this.tab.attr('__update', val);
            return this;
          },
          getState: function() {
            return this.tab.attr('__update');
          }
        };
      });

      //futuramente trocar por um has_table
      $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', e => {
        if ($(e.target).attr('__update') == 'true') {
          this.dt.ajax.reload();
          $(e.target).attr('__update', false);
        }
        if ($(e.target).attr('__name') == 'listar') this.dt.columns.adjust();
      });

      $('.btn-new').on('click', e => {
        $('.btn-new').blur();
        swal({
          title: 'Novo Registro',
          text: 'Deseja iniciar o cadastro de um novo registro?',
          showCancelButton: true,
          type: 'question'
        }).then(result => {
          if (result.value) {
            if (!IO.active.onNew) {
              IO.active.unload(IO.active);
              IO.active.callbacks.unload(IO.active);
              setTimeout(() => {
                IO.active.tabs['cadastrar'].tab.tab('show');
                IO.active.df
                  .find('input:enabled,input:enabled')
                  .first()
                  .focus();
              }, 100);
            } else {
              IO.active.onNew(IO.active);
            }
            //document.location.reload();
          }
        });
      });

      //corrige bug da nav-tab mostrar 2 actives
      $('a[data-toggle="tab"]').on('show.bs.tab', e => {
        let ntab = $(e.target);
        let ptab = $(e.relatedTarget);
        $(ptab.attr('href')).removeClass('active');
        $(ntab.attr('href')).addClass('active');
      });

      callback(this);
    });

    /// fim do self

    //methods
    /** DEFAULT Wizard actions*/
    this.wizardActions = callback => {
      this.wz.keys = {
        fv: this.fv,
        numtabs: this.df.find('.step-pane').length
      };

      if (this.wz.keys.numtabs == 1) {
        $('.btn-next')
          .addClass('btn-success')
          .addClass('btn-success');
        $('.btn-next .ico')
          .removeClass('ico-arrow-right')
          .addClass('ico-save');
      }

      //do is necessary?
      // let self = this;
      return this.wz
        .on('actionclicked.fu.wizard', (e, data) => {
          this.fv.caller = 'wizard';
          this.wz.keys.step = data.step;
          this.wz.keys.direction = data.direction;
          this.wz.keys.container = this.df.find(
            '.step-pane[data-step="' + this.wz.keys.step + '"]'
          );

          if (this.wz.keys.step != this.wz.keys.numtabs) {
            e.preventDefault();
          }

          if (this.wz.keys.direction == 'previous') {
            //voltando do último para o penúltimo
            if (
              this.wz.keys.step == this.wz.keys.numtabs &&
              this.wz.keys.direction == 'previous'
            ) {
              $('.btn-next')
                .removeClass('btn-success')
                .addClass('btn-secondary');
              $('.btn-next .ico')
                .removeClass('ico-save')
                .addClass('ico-arrow-right');
            }

            this.wz.wizard('selectedItem', { step: this.wz.keys.step - 1 });
          } else {
            //??global or not?
            var isValidStep = null;
            this.wz.keys.fv[this.wz.keys.step - 1].validate().then(status => {
              if (status === 'Valid') isValidStep = true;
              else isValidStep = false;

              //saindo do penúltimo para o último
              if (
                this.wz.keys.step == this.wz.keys.numtabs - 1 &&
                isValidStep
              ) {
                $('.btn-next').addClass('btn-success');
                $('.btn-next .ico')
                  .removeClass('ico-arrow-right')
                  .addClass('ico-save');
              }

              if (isValidStep != false && isValidStep != null) {
                this.wz.wizard('selectedItem', {
                  step: this.wz.keys.step + 1
                });
              }
            });
          }
        })
        .on('finished.fu.wizard', e => {
          var isValidStep = null;
          this.wz.keys.fv[this.wz.keys.fv.length - 1]
            .validate()
            .then(status => {
              if (status === 'Valid') isValidStep = true;
              else isValidStep = false;

              callback();
              //prepare extra data to submit
              if (isValidStep === true) {
                if (this.toView !== null) {
                  this.update(this.toView);
                } else {
                  this.isUpdate = false;
                  $(this.df)
                    .find('[always-send]')
                    .each((index, el) => {
                      const attr = el.getAttribute('disabled');
                      if (attr != null) {
                        el.removeAttribute('disabled');
                        el.setAttribute('restore-disabled', attr);
                      }
                    });

                  let serialized = this.df
                    .serializeArray()
                    .concat(this.getExtraData());

                  serialized.push({ name: 'isUpdate', value: false });

                  $(this.df)
                    .find('[always-send]')
                    .each((index, el) => {
                      const attr = el.getAttribute('restore-disabled');
                      if (attr != null) {
                        el.setAttribute('disabled', attr);
                        el.removeAttribute('restore-disabled');
                      }
                    });

                  $.ajax({
                    url: this.df.attr('action'),
                    method: 'POST',
                    data: serialized,
                    beforeSend: function() {
                      // HoldOn.open({
                      //   message: 'Salvando dados, aguarde...',
                      //   theme: 'sk-bounce'
                      // });
                    },
                    success: data => {
                      if (data.success) {
                        if (!this.override.create.onSuccess) {
                          try {
                            this.tabs['listar'].setState(true);
                          } catch (err) {}
                          this.callbacks.create.onSuccess(data);
                          HoldOn.close();
                          swal({
                            title: 'Cadastro efetuado com sucesso!',
                            confirmButtonText: 'OK',
                            type: 'success',
                            onClose: () => {
                              this.unload(this);
                            }
                          });
                        } else {
                          this.override.create.onSuccess(data);
                        }
                      }
                    },
                    error: ret => {
                      this.defaults.ajax.onError(
                        ret,
                        this.callbacks.create.onError
                      );
                    }
                  }); //end ajax
                } //endelse
              }
            });
        })
        .on('stepclicked.fu.wizard', (e, data) => {
          if (data.step !== this.wz.keys.numtabs) {
            $('.btn-next').removeClass('btn-success');
            $('.btn-next .ico')
              .removeClass('ico-save')
              .addClass('ico-arrow-right');
          }
        });
    };

    //CRUD Actions

    this.getExtraData = function() {
      return Object.keys(this.extraData).map(el => {
        return {
          name: el,
          value: this.extraData[el]
        };
      });
    };

    this.view = function(id) {
      this.unload(this);
      $.ajax({
        url: this.path + '/view/' + id,
        beforeSend: function() {
          HoldOn.open({
            message: 'Carregando dados, aguarde...',
            theme: 'sk-bounce'
          });
        },
        success: ret => {
          if (ret.success) {
            var data = ret.data[0];
            this.toView = data;
            $('.btn-info-edit')
              .css({ display: 'inline' })
              .find('.badge')
              .text(id);

            this.callbacks.view.onSuccess(data);

            //when editing, need to repeat this peace of code
            if (this.wz.keys.numtabs == 1) {
              $('.btn-next')
                .addClass('btn-success')
                .addClass('btn-success');
              $('.btn-next .ico')
                .removeClass('ico-arrow-right')
                .addClass('ico-save');
            }

            setTimeout(() => {
              this.tabs['cadastrar'].tab.tab('show');
              HoldOn.close();
              //focus on first enabled element, to fix placeholder glitch
              this.df
                .find('input:enabled,input:enabled')
                .first()
                .focus();
            }, 500);
          }
        },
        error: ret => {
          this.defaults.ajax.onError(ret, this.callbacks.view.onError);
          HoldOn.close();
        }
      });
    };

    //update
    this.update = function(data) {
      let serialized = this.df.serializeArray().concat(this.getExtraData());
      serialized.push({ name: 'isUpdate', value: data.id });
      $.ajax({
        method: 'POST',
        url: `${this.path}/update/${data.id}`,
        cache: false,
        dataType: 'json',
        data: serialized,
        beforeSend: function() {
          HoldOn.open({
            message: 'Atualizando dados, aguarde...',
            theme: 'sk-bounce'
          });
        },
        success: ret => {
          HoldOn.close();
          if (ret.success) {
            try {
              //set list tab as updatable
              this.tabs['listar'].setState(true);
              this.callbacks.update.onSuccess(ret);
              swal({
                title: 'Sucesso',
                text: 'O registro foi atualizado com sucesso!',
                type: 'success',
                confirmButtonText: 'OK',
                onClose: () => {
                  this.unload(self);
                }
              });
            } catch (err) {
              this.callbacks.update.onSuccess(ret);
            }
          }
        },
        error: ret => {
          this.defaults.ajax.onError(ret, this.callbacks.update.onError);
        }
      });
    };

    //update
    this.delete = function(id, params = {}) {
      swal.queue([
        {
          title: 'Excluir Registro?',
          html:
            'Ao executar esta ação <b>todas as informações vinculadas a este registro serão perdidas</b>, confirma a exclusão?',
          type: 'question',
          confirmButtonText:
            "<i class = 'ico ico-thumbs-up'></i> Sim, confirmo",
          cancelButtonText:
            "<i class = 'ico ico-thumbs-down'></i> Não, cancelar",
          showCancelButton: true,
          reverseButtons: true,
          showLoaderOnConfirm: true,
          preConfirm: () => {
            return new Promise(resolve => {
              $.get(params.url ? params.url : `${this.path}/delete/${id}`)
                .done(ret => {
                  if (ret.sts == true) {
                    swal.insertQueueStep({
                      title: 'Registro excluído!',
                      html:
                        'O registro <b>' + id + '</b> foi excluído do sistema!',
                      type: 'success'
                    });
                    this.callbacks.delete.onSuccess(ret);
                  } else
                    swal.insertQueueStep({
                      title:
                        'Ocorreram problemas, o registro não pode ser removido!',
                      type: 'error'
                    });

                  this.dt.ajax.reload();
                  this.dt.draw(true);
                  resolve();
                })
                .fail(function(ret) {
                  if (ret.status == 403) {
                    var data = JSON.parse(ret.responseText);
                    for (var err in data.errors) {
                      toastr['error'](data.errors[err]);
                    }
                  }
                  resolve();
                });
            });
          }
        }
      ]);
    };

    //update
    this.unload = () => {
      $('.btn-next')
        .removeClass('btn-success')
        .addClass('btn-primary')
        .get();
      $('.btn-next .ico')
        .removeClass('ico-save')
        .addClass('ico-arrow-right');
      $('.btn-next').get()[0].firstChild.nodeValue = $('.btn-next').attr(
        'data-next'
      );
      this.toView = null;
      this.isUpdate = false;
      this.df[0].reset();
      $('.btn-info-edit')
        .css({ display: 'none' })
        .find('.badge')
        .text('');

      this.fv.forEach((element, index, array) => {
        try {
          this.fv[index].resetForm(true);
        } catch (err) {}
      });

      this.callbacks.unload(this);
      this.wz.wizard('selectedItem', { step: 1 });
      this.df
        .find('input:enabled')
        .first()
        .focus();
    };

    //Default CRUD ajax request onerror
    this.defaults.ajax = {
      onError: function(ret, callback) {
        if (ret.status == 422) {
          var data = JSON.parse(ret.responseText);
          HoldOn.close();

          Object.values(data.errors).forEach(err => {
            toastr['error'](err);
            try {
              self.df.formValidation('updateStatus', err, 'NOT_VALIDATED');
            } catch (err) {
              console.warn('ajax insert/update 422');
            }
          });
        }

        if (ret.status == 403) {
          var data = JSON.parse(ret.responseText);
          HoldOn.close();
          for (var err in data.errors) {
            toastr['error'](data.errors[err]);
            try {
              self.df.formValidation('updateStatus', err, 'NOT_VALIDATED');
            } catch (err) {
              console.warn('ajax insert/update 403');
            }
          }
        }
        callback(self);
      }
    }; //end ajax error

    if (this.cem.length > 0) {
      let _self = this;
      this.cdt = $('#categories-table')
        .DataTable({
          aaSorting: [[0, 'desc']],
          searching: false,
          ajax: '/categories/serviceChildCats/' + serviceMainCat.id,
          initComplete: function(data) {},
          footerCallback: function(row, data, start, end, display) {},
          columns: [
            { data: 'id', name: 'id' },
            { data: 'category', name: 'category' },
            { data: 'category_id', name: 'category_id' },
            { data: 'description', name: 'description' },
            { data: 'actions', name: 'actions' }
          ],
          columnDefs: [
            { targets: '__dt_', width: '5%', className: 'text-center' },
            { targets: '__dt_categoria', width: '20%' },
            {
              targets: '__dt_categoria-pai',
              width: '10%',
              className: 'text-center'
            },
            {
              targets: '__dt_acoes',
              width: '8%',
              className: 'text-center',
              searchable: false,
              orderable: false,
              render: function(data, type, row, y) {
                return _self.cdt.addDTButtons({
                  buttons: [
                    { ico: 'ico-edit', _class: 'text-info', title: 'editar' },
                    {
                      ico: 'ico-trash',
                      _class: 'text-danger',
                      title: 'excluir'
                    }
                  ]
                });
              }
            }
          ]
        })
        .on('xhr.dt', (e, settings, json, xhr) => {
          this.cem.find('select#category_id').empty();

          this.cem
            .find('select#category_id')
            .append(
              "<option value='" + serviceMainCat.id + "'>Nenhuma</option>"
            );

          json.data.forEach((item, index) => {
            this.cem
              .find('select#category_id')
              .append(
                "<option value='" +
                  item.id +
                  "'>#" +
                  item.id +
                  ' - ' +
                  item.category +
                  '</option>'
              );
          });
        })
        .on('click', '.btn-dt-button[data-original-title=editar]', function() {
          var data = _self.cdt.row($(this).parents('tr')).data();

          self.cem.find('input#edit').val(data.id);
          self.cem.find('input#category').val(data.category);
          self.cem.find('textarea#description').val(data.description);
          self.cem.find('select#category_id').val(data.category_id);

          _self.cem.modal('show');
        })
        .on('click', '.ico-trash', function() {
          var data = _self.cdt.row($(this).parents('tr')).data();
          _self.deleteCategory(data.id);
        });

      $('button#new-category').on('click', () => {
        this.cem.find('input#edit').val(-1);
        this.cem.find('input#category').val('');
        this.cem.find('textarea#description').val('');
        this.cem.find('select#category_id').val(serviceMainCat.id);

        this.cem.modal('show');
      });

      $('button#save-category').on('click', () => {
        var formData = $('#category-form').serializeArray();

        if (this.cem.find('input#edit').val() == '-1')
          this.createCategory(formData);
        else this.updateCategory(formData);
      });
    }

    this.createCategory = function createCategory(formData) {
      $.ajax({
        url: '/categories/create',
        method: 'POST',
        data: formData,
        beforeSend: function() {
          HoldOn.open({
            message: 'Salvando dados, aguarde...',
            theme: 'sk-bounce'
          });
        },
        success: function(data) {
          if (data.success) {
            self.tabs['categorias'].setState(true);
            self.tabs['categorias'].tab.tab('show');
            self.cem.modal('hide');
            HoldOn.close();
            swal({
              title: 'Cadastro efetuado com sucesso!',
              confirmButtonText: 'OK',
              type: 'success',
              onClose: function() {
                // self.cdt.ajax.reload();
                // self.cdt.draw(true);
                location.reload();
              }
            });
          }
        },
        error: function(ret) {
          self.defaults.ajax.onError(ret, self.callbacks.create.onError);
        }
      }); //end ajax
    };

    this.updateCategory = function updateCategory(formData) {
      $.ajax({
        url: '/categories/update',
        method: 'POST',
        data: formData,
        beforeSend: function() {
          HoldOn.open({
            message: 'Atualizando dados, aguarde...',
            theme: 'sk-bounce'
          });
        },
        success: function(data) {
          if (data.success) {
            self.tabs['categorias'].setState(true);
            self.tabs['categorias'].tab.tab('show');
            self.cem.modal('hide');
            HoldOn.close();
            swal({
              title: 'O registro foi atualizado com sucesso!',
              confirmButtonText: 'OK',
              type: 'success',
              onClose: function() {
                // self.cdt.ajax.reload();
                // self.cdt.draw(true);
                location.reload();
              }
            });
          }
        },
        error: function(ret) {
          self.defaults.ajax.onError(ret, self.callbacks.create.onError);
        }
      }); //end ajax
    };

    this.deleteCategory = function deleteCategory(id) {
      swal.queue([
        {
          title: 'Excluir Registro?',
          html:
            'Ao executar esta ação <b>todas as informações vinculadas a este registro serão perdidas</b>, confirma a exclusão?',
          type: 'question',
          confirmButtonText:
            "<i class = 'ico ico-thumbs-up'></i> Sim, confirmo",
          cancelButtonText:
            "<i class = 'ico ico-thumbs-down'></i> Não, cancelar",
          showCancelButton: true,
          reverseButtons: true,
          showLoaderOnConfirm: true,
          preConfirm: function() {
            return new Promise(function(resolve) {
              $.get('/categories/delete/' + id)
                .done(function(ret) {
                  if (ret.sts == true) {
                    swal.insertQueueStep({
                      title: 'Registro excluído!',
                      html:
                        'O registro <b>' + id + '</b> foi excluído do sistema!',
                      type: 'success'
                    });
                  } else
                    swal.insertQueueStep({
                      title:
                        'Ocorreram problemas, o registro não pode ser removido!',
                      type: 'error'
                    });

                  // self.cdt.ajax.reload();
                  // self.cdt.draw(true);
                  resolve();
                })
                .fail(function(ret) {
                  if (ret.status == 403) {
                    var data = JSON.parse(ret.responseText);
                    for (var err in data.errors) {
                      toastr['error'](data.errors[err]);
                    }
                  }
                  resolve();
                });
            }).then(function(value) {
              setTimeout(function() {
                location.reload();
              }, 2000);
            });
          }
        }
      ]);
    };
  }
} //end DVService
