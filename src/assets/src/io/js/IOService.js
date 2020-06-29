/** default CRUD operations to all Service Classes ******************************************************/
/** Separar o DVService em outro arquivo*/
//ESSA CLASSE QUE DÁ O ERRO DO WEBPACK

class IOService {
  constructor(params, callback) {
    this.toView = null;
    this.tabs = {};
    this.defaults = { ajax: null };
    this.name = params.name;
    this.alias = params.name.toLowerCase();
    this.path = params.path || params.name.toLowerCase();
    // this.cdt = null; //categories datatable
    // this.cem = $("#categories-crud-modal"); //category edit modal
    // this.createCategory = null; //service's categories
    // this.updateCategory = null; //service's categories
    // this.deleteCategory = null; //service's categories
    this.dt = null;
    this.fv = null;
    this.dz = null;
    // this.isUpdate = false;
    this.extraData = {};
    this.dfId = params.dfId || "default-form";
    this.df = $("#" + this.dfId);
    this.wz = params.wz || $("#default-wizard").wizard();
    this.onNew = false;
    this.callbacks = {
      view: { onSuccess: function() {}, onError: function() {} },
      create: { onSuccess: function() {}, onError: function() {} },
      update: { onSuccess: function() {}, onError: function() {} },
      delete: { onSuccess: function() {}, onError: function() {} },
      unload: function() {},
    };

    this.override = {
      view: { onSuccess: false, onError: false },
      create: { onSuccess: false, onError: false },
      update: { onSuccess: false, onError: false },
      delete: { onSuccess: false, onError: false },
      unload: false,
    };

    //
    for (p in params) this[p] = params[p];

    // const self = this;

    // IO.active = this;
    IO.services[this.name.toLowerCase()] = this;

    $(document).ready(() => {
      let self = this;
      IO.active = this;
      this.config = {
        default: JSON.parse(window.sessionStorage.getItem("IntranetOne")),
        user: JSON.parse(window.sessionStorage.getItem("configUser")),
      };

      $("a[data-toggle='tab'").each((i, obj) => {
        let __tab = null;
        if (this.alias === $(obj).attr("_service")) {
          __tab = IO.services[$(obj).attr("_service")].tabs;

          $(obj).on("shown.bs.tab", (e) => {
            IO.active = IO.services[$(e.target).attr("_service")];
            // console.log("só aqui ", $(e.target).attr("_service"));
          });
        } else {
          if (["", null, undefined].includes($(obj).attr("_service"))) {
            __tab = this.tabs;
          }
        }

        if (__tab)
          __tab[$(obj).attr("__name")] = {
            tab: $(obj),
            setState: function(val) {
              this.tab.attr("__update", val);
              return this;
            },
            getState: function() {
              return this.tab.attr("__update");
            },
          };
      });

      //futuramente trocar por um has_table
      $(document).on("shown.bs.tab", 'a[data-toggle="tab"]', (e) => {
        if ($(e.target).attr("__update") == "true") {
          this.dt.ajax.reload();
          $(e.target).attr("__update", false);
        }
        if ($(e.target).attr("__name") == "listar") this.dt.columns.adjust();
      });

      $(".btn-new").on("click", (e) => {
        $(".btn-new").blur();
        swal({
          title: "Novo Registro",
          text: "Deseja iniciar o cadastro de um novo registro?",
          showCancelButton: true,
          type: "question",
        }).then((result) => {
          if (result.value) {
            if (!IO.active.onNew) {
              IO.active.unload(IO.active);
              IO.active.callbacks.unload(IO.active);
              setTimeout(() => {
                IO.active.tabs["cadastrar"].tab.tab("show");
                IO.active.df
                  .find("input:enabled,input:enabled")
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
      $('a[data-toggle="tab"]').on("show.bs.tab", (e) => {
        let ntab = $(e.target);
        let ptab = $(e.relatedTarget);
        $(ptab.attr("href")).removeClass("active");
        $(ntab.attr("href")).addClass("active");
      });

      callback(this);
    });

    /// fim do self

    //methods
    /** DEFAULT Wizard actions*/
    this.wizardActions = (callback) => {
      this.wz.keys = {
        fv: this.fv,
        numtabs: this.df.find(".step-pane").length,
      };

      if (this.wz.keys.numtabs == 1) {
        this.df.find(".btn-prev").hide();
        this.df
          .find(".btn-next")
          .addClass("btn-success")
          .addClass("btn-success");
        this.df
          .find(".btn-next .ico")
          .removeClass("ico-arrow-right")
          .addClass("ico-save");
      }

      //do is necessary?
      // let self = this;
      return this.wz
        .on("actionclicked.fu.wizard", (e, data) => {
          this.fv.caller = "wizard";
          this.wz.keys.step = data.step;
          this.wz.keys.direction = data.direction;
          this.wz.keys.container = this.df.find(
            '.step-pane[data-step="' + this.wz.keys.step + '"]'
          );

          const _maxtab = this.wz.keys.numtabs - 1;

          if (this.wz.keys.step !== this.wz.keys.numtabs) {
            e.preventDefault();
          }

          //   if (this.wz.keys.step === 0) {
          //     this.df.find(".btn-prev").hide();
          //   } else {
          // this.df.find(".btn-prev").hide();
          //   }

          if (this.wz.keys.direction == "previous") {
            //voltando do último para o penúltimo
            if (this.wz.keys.step == this.wz.keys.numtabs) {
              this.df
                .find(".btn-next")
                .removeClass("btn-success")
                .addClass("btn-secondary");
              this.df
                .find(".btn-next .ico")
                .removeClass("ico-save")
                .addClass("ico-arrow-right");
            }
            this.wz.wizard("selectedItem", {
              step: this.wz.keys.step,
            });
          } else {
            //avança
            var isValidStep = null;
            this.wz.keys.fv[this.wz.keys.step - 1].validate().then((status) => {
              if (status === "Valid") isValidStep = true;
              else isValidStep = false;

              //saindo do penúltimo para o último
              if (
                this.wz.keys.step == this.wz.keys.numtabs - 1 &&
                isValidStep
              ) {
                this.df.find(".btn-next").addClass("btn-success");
                this.df
                  .find(".btn-next .ico")
                  .removeClass("ico-arrow-right")
                  .addClass("ico-save");
              }

              if (isValidStep != false && isValidStep != null) {
                this.wz.wizard("selectedItem", {
                  step: this.wz.keys.step + 1,
                });
              }
            });
          }
        })
        .on("finished.fu.wizard", (e) => {
          var isValidStep = null;
          this.wz.keys.fv[this.wz.keys.fv.length - 1]
            .validate()
            .then((status) => {
              if (status === "Valid") isValidStep = true;
              else isValidStep = false;

              callback();
              //prepare extra data to submit
              if (isValidStep === true) {
                if (this.toView !== null) {
                  this.update(this.toView);
                } else {
                  this.isUpdate = false;
                  $(this.df)
                    .find("[always-send]")
                    .each((index, el) => {
                      const attr = el.getAttribute("disabled");
                      if (attr != null) {
                        el.removeAttribute("disabled");
                        el.setAttribute("restore-disabled", attr);
                      }
                    });

                  let serialized = this.df
                    .serializeArray()
                    .concat(this.getExtraData());

                  serialized.push({ name: "isUpdate", value: false });

                  $(this.df)
                    .find("[always-send]")
                    .each((index, el) => {
                      const attr = el.getAttribute("restore-disabled");
                      if (attr != null) {
                        el.setAttribute("disabled", attr);
                        el.removeAttribute("restore-disabled");
                      }
                    });

                  $.ajax({
                    url: this.df.attr("action"),
                    method: "POST",
                    data: serialized,
                    beforeSend: function() {
                      // HoldOn.open({
                      //   message: 'Salvando dados, aguarde...',
                      //   theme: 'sk-bounce'
                      // });
                    },
                    success: (data) => {
                      if (data.success) {
                        if (!this.override.create.onSuccess) {
                          try {
                            this.tabs["listar"].setState(true);
                          } catch (err) {}
                          this.callbacks.create.onSuccess(data);
                          HoldOn.close();
                          swal({
                            title: "Cadastro efetuado com sucesso!",
                            confirmButtonText: "OK",
                            type: "success",
                            onClose: () => {
                              this.unload(this);
                            },
                          });
                        } else {
                          this.override.create.onSuccess(data);
                        }
                      }
                    },
                    error: (ret) => {
                      if (ret.status == 422) {
                        var data = JSON.parse(ret.responseText);
                        for (var err in data.errors) {
                          toastr["error"](data.errors[err]);
                        }
                      }
                      //monitorar se é necessário o update no error
                      // this.defaults.ajax.onError(
                      //   ret,
                      //   this.callbacks.create.onError
                      // );
                    },
                  }); //end ajax
                } //endelse
              }
            });
        })
        .on("stepclicked.fu.wizard", (e, data) => {
          if (data.step !== this.wz.keys.numtabs) {
            this.df.find(".btn-next").removeClass("btn-success");
            this.df
              .find(".btn-next .ico")
              .removeClass("ico-save")
              .addClass("ico-arrow-right");
          }
        });
    };

    //CRUD Actions

    this.getExtraData = function() {
      return Object.keys(this.extraData).map((el) => {
        return {
          name: el,
          value: this.extraData[el],
        };
      });
    };

    this.view = function(id, params) {
      const p = Object.assign(
        {
          tabFocus: true,
        },
        params
      );

      this.unload(this);
      $.ajax({
        url: `${this.path}/view/${id}`,
        beforeSend: function() {
          HoldOn.open({
            message: "Carregando dados, aguarde...",
            theme: "sk-bounce",
          });
        },
        success: (ret) => {
          if (ret.success) {
            var data = ret.data[0];
            this.toView = data;
            $(".btn-info-edit")
              .css({ display: "inline" })
              .find(".badge")
              .text(id);

            this.callbacks.view.onSuccess(data);

            //when editing, need to repeat this peace of code
            if (this.wz.keys.numtabs == 1) {
              this.df
                .find(".btn-next")
                .addClass("btn-success")
                .addClass("btn-success");
              this.df
                .find(".btn-next .ico")
                .removeClass("ico-arrow-right")
                .addClass("ico-save");
            }
            if (p.tabFocus)
              setTimeout(() => {
                this.tabs["cadastrar"].tab.tab("show");
                HoldOn.close();
                //focus on first enabled element, to fix placeholder glitch
                this.df
                  .find("input:enabled,input:enabled")
                  .first()
                  .focus();
              }, 500);
          }
        },
        error: (ret) => {
          this.defaults.ajax.onError(ret, this.callbacks.view.onError);
          HoldOn.close();
        },
      });
    };

    //update
    this.update = function(data) {
      let serialized = this.df.serializeArray().concat(this.getExtraData());
      serialized.push({ name: "isUpdate", value: data.id });
      $.ajax({
        method: "POST",
        url: `${this.path}/update/${data.id}`,
        cache: false,
        dataType: "json",
        data: serialized,
        beforeSend: function() {
          HoldOn.open({
            message: "Atualizando dados, aguarde...",
            theme: "sk-bounce",
          });
        },
      })
        .done((ret) => {
          HoldOn.close();
          if (ret.success) {
            if (!this.override.update.onSuccess) {
              try {
                //set list tab as updatable

                this.tabs["listar"].setState(true);
                this.callbacks.update.onSuccess(ret);
                swal({
                  title: "Sucesso",
                  text: "O registro foi atualizado com sucesso!",
                  type: "success",
                  confirmButtonText: "OK",
                  onClose: () => {
                    this.unload(self);
                  },
                });
              } catch (err) {
                console.log("erro no callback");
                this.callbacks.update.onSuccess(ret);
              }
            } else this.override.update.onSuccess(ret);
          }
        })
        .fail((ret) => {
          // this.defaults.ajax.onError(ret, this.callbacks.update.onError);
          if (ret.status == 422) {
            var data = JSON.parse(ret.responseText);
            for (var err in data.errors) {
              toastr["error"](data.errors[err]);
            }
          }
          //monitorar se é necessário o update no error
        })
        .always(() => {
          HoldOn.close();
        });
    };

    //update
    this.delete = function(id, params = {}) {
      swal.queue([
        {
          title: "Excluir Registro?",
          html:
            "Ao executar esta ação <b>todas as informações vinculadas a este registro serão perdidas</b>, confirma a exclusão?",
          type: "question",
          confirmButtonText:
            "<i class = 'ico ico-thumbs-up'></i> Sim, confirmo",
          cancelButtonText:
            "<i class = 'ico ico-thumbs-down'></i> Não, cancelar",
          showCancelButton: true,
          reverseButtons: true,
          showLoaderOnConfirm: true,
          preConfirm: () => {
            return new Promise((resolve) => {
              $.get(params.url ? params.url : `${this.path}/delete/${id}`)
                .done((ret) => {
                  if (ret.sts == true) {
                    swal.insertQueueStep({
                      title: "Registro excluído!",
                      html:
                        "O registro <b>" + id + "</b> foi excluído do sistema!",
                      type: "success",
                    });
                    this.callbacks.delete.onSuccess(ret);
                  } else
                    swal.insertQueueStep({
                      title:
                        "Ocorreram problemas, o registro não pode ser removido!",
                      type: "error",
                    });

                  this.dt.ajax.reload();
                  this.dt.draw(true);
                  resolve();
                })
                .fail(function(ret) {
                  if (ret.status == 403) {
                    var data = JSON.parse(ret.responseText);
                    for (var err in data.errors) {
                      toastr["error"](data.errors[err]);
                    }
                  }
                  resolve();
                });
            });
          },
        },
      ]);
    };

    //update
    this.unload = (params) => {
      const p = Object.assign(
        {
          refreshButtons: true,
        },
        params
      );

      if (p.refreshButtons) {
        this.df
          .find(".btn-next")
          .removeClass("btn-success")
          .addClass("btn-primary")
          .get();
        this.df
          .find(".btn-next .ico")
          .removeClass("ico-save")
          .addClass("ico-arrow-right");
        this.df.find(".btn-next").get()[0].firstChild.nodeValue = $(
          ".btn-next"
        ).attr("data-next");
      }

      this.toView = null;
      this.isUpdate = false;
      this.df[0].reset();
      $(".btn-info-edit")
        .css({ display: "none" })
        .find(".badge")
        .text("");

      this.fv.forEach((element, index, array) => {
        try {
          this.fv[index].resetForm(true);
        } catch (err) {}
      });

      this.callbacks.unload(this);
      this.wz.wizard("selectedItem", { step: 1 });
      this.df
        .find("input:enabled")
        .first()
        .focus();
    };
  }
} //end DVService
