function Category(p = {}) {
  const def = Object.assign(
    {
      name: "Category",
      dfId: "category-form",
      path: "category",
      wz: $("#category-wizard").wizard(),
      tabName: "categorias",
      parentService: null,
      forceAll: false,
    },
    p
  );

  new IOService(def, (self) => {
    const prefix = "cat_";
    //force behavior as side service
    IO.active = self.parentService;

    self.fields = {
      service: null,
      category: null,
    };

    self.tabs[def.tabName].tab.on("shown.bs.tab", (e) => {
      IO.active = self;
      self.dt.ajax.reload();
      self.dt.columns.adjust();
    });

    //Datatables initialization

    self.fields.category = new SlimSelect({
      select: `#${prefix}category_id`,
      searchText: "Nenhuma categoria encontrada!",
      placeholder: " ",
      allowDeselect: true,
      deselectLabel:
        '<span class="ico ico-close" style="font-size:10px; color:red"></span>',
      searchPlaceholder: "Procurar",
      onChange: function(info) {},
    });

    self.fields.service = new SlimSelect({
      select: `#${prefix}service_id`,
      searchText: "Nenhum serviço encontrado!",
      placeholder: " ",
      allowDeselect: true,
      deselectLabel:
        '<span class="ico ico-close" style="font-size:10px; color:red"></span>',
      searchPlaceholder: "Procurar",
      onChange: function(info) {
        document.getElementById(`${prefix}__service_id`).value = info.value;
      },
    });

    catGetCategories({
      self,
      service: self.parentService.alias,
      type: "json",
      onlyCategories: true,
    })
      .then((arr) => {
        const cats = arr.map(({ id, cat }) => {
          return {
            text: cat,
            value: `${id}`,
          };
        });

        self.fields.category.setData(cats);
        self.fields.category.set(""); //zera o campo
      })
      .catch((err) => {
        self.fields.category.setData([]);
      });

    catGetServices({
      self,
    })
      .then((arr) => {
        const serv = arr.map((data) => {
          return {
            text: data.trans,
            value: `${data.alias}`,
          };
        });

        self.fields.service.setData(serv);
        self.fields.service.set(""); //zera o campo

        //trava o campo no serviço passado
        if (self.parentService !== null && !self.forceAll) {
          // console.log(self.parentService.alias);
          self.fields.service.set(self.parentService.alias);
          self.fields.service.disable();
        }
      })
      .catch((err) => {
        console.log("error", err);
        // self.fields.service.select.disable();
        self.fields.service.setData([]);
      });

    $(`#${prefix}erasable`)
      .attrchange(function(attrName) {
        if (attrName == "aria-pressed") {
          $(`#${prefix}__erasable`).val($(this).attr("aria-pressed"));

          if ($(this).attr("aria-pressed") == "true") {
            this.nextElementSibling.style.opacity = "1";
            this.previousElementSibling.style.opacity = ".3";
          } else {
            this.nextElementSibling.style.opacity = ".3";
            this.previousElementSibling.style.opacity = "1";
          }
        }
      })
      .aaDefaultState();

    // $("#isWhatsapp").;

    //tabela

    self.dt = $("#category-table")
      .DataTable({
        serverSide: true,
        ajax: {
          url: `${self.path}/list`,
          type: "POST",
          data: {
            type: "datatables",
            service: self.parentService.alias,
          },
        },
        aaSorting: [[0, "desc"]],
        initComplete: function() {
          let api = this.api();
          $.fn.dataTable.defaults.initComplete(this);
        },
        footerCallback: function(row, data, start, end, display) {},
        columns: [
          { data: "id", name: "id" },
          { data: "service", name: "servico" },
          { data: "category", name: "categoria" },
          { data: "cat", name: "nome" },
          { data: "erasable", name: "acoes" },
        ],
        columnDefs: [
          { targets: "__dt_", width: "3%", searchable: true, orderable: true },
          {
            targets: "__dt_servico",
            searchable: true,
            orderable: true,
            width: "15%",
            render: function(data, type, row) {
              return data
                ? data.service
                : row.category
                ? row.category.service
                  ? row.category.service.service
                  : ""
                : "";
            },
          },
          {
            targets: "__dt_categoria",
            searchable: true,
            orderable: true,
            width: "25%",
            render: function(data, type, row) {
              return data ? data.category : "";
            },
          },
          {
            targets: "__dt_nome",
            searchable: true,
            orderable: true,
            render: function(data, type, row) {
              return data;
            },
          },
          {
            targets: "__dt_acoes",
            width: "5%",
            className: "text-center",
            searchable: false,
            orderable: false,
            render: function(data) {
              let excl = {
                ico: "ico-trash",
                _class: "text-danger",
                title: "excluir",
              };

              if (!data)
                excl = {
                  ico: "ico-trash",
                  _class: "disabled",
                  title: "permanente",
                };
              return self.dt.addDTButtons({
                buttons: [
                  { ico: "ico-edit", _class: "text-info", title: "Editar" },
                  excl,
                ],
              });
            },
          },
        ],
      })
      .on("click", ".ico-trash", function() {
        var data = self.dt.row($(this).parents("tr")).data();
        if (data.erasable) self.delete(data.id);
      })
      .on("click", ".btn-dt-button[data-original-title=Editar]", function() {
        var data = self.dt.row($(this).parents("tr")).data();
        self.view(data.id, {
          tabFocus: false,
        });
      })
      .on("draw.dt", function() {
        $('[data-toggle="tooltip"]').tooltip();
      });

    let form = document.getElementById("category-form");

    let fv1 = FormValidation.formValidation(
      form.querySelector('.step-pane[data-step="1"]'),
      {
        fields: {
          cat_category: {
            validators: {
              notEmpty: {
                enabled: true,
                message: "O Nome da categoria/subcategoria é obrigatório",
              },
            },
          },
          cat_config: {
            validators: {
              callback: {
                message: "Formato JSON inválido!",
                callback: function(el) {
                  if (el.value === "") return true;
                  let ret;
                  try {
                    JSON.parse(el.value);
                    ret = true;
                  } catch (err) {
                    ret = false;
                  }
                  return ret;
                },
              },
            },
          },
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          submitButton: new FormValidation.plugins.SubmitButton(),
          bootstrap: new FormValidation.plugins.Bootstrap(),
          icon: new FormValidation.plugins.Icon({
            valid: "fv-ico ico-check",
            invalid: "fv-ico ico-close",
            validating: "fv-ico ico-gear ico-spin",
          }),
        },
      }
    )
      .setLocale("pt_BR", FormValidation.locales.pt_BR)
      .on("core.validator.validated", function(e) {});

    self.fv = [fv1];

    //need to transform wizardActions in a method of Class
    self.wizardActions(function() {});

    IO.services["category"].onNew = (self) => {
      console.log("não deveria");
      self.unload({
        refreshButtons: false,
      });
    };

    self.callbacks.unload = (self) => {
      $("#cat_category, #cat___service_id, #cat___config, #cat_config").val("");
      $("#cat_erasable").aaDefaultState();
      if (self.parentService !== null && self.forceAll) {
        self.fields.service.set(self.parentService.alias);
        self.fields.service.disable();
      } else self.fields.service.set("");

      catGetCategories({
        self,
        service: self.parentService.alias,
        type: "json",
        onlyCategories: true,
      })
        .then((arr) => {
          const cats = arr.map(({ id, cat }) => {
            return {
              text: cat,
              value: `${id}`,
            };
          });

          self.fields.category.setData(cats);
          self.fields.category.set(""); //zera o campo
        })
        .catch((err) => {
          self.fields.category.setData([]);
        })
        .finally(() => {
          self.fields.category.set("");
        });
    };

    self.override.create.onSuccess = (data) => {
      if (data.success) {
        self.callbacks.create.onSuccess(data);
        HoldOn.close();
        swal({
          title: "categoria cadastrada com sucesso!",
          confirmButtonText: "OK",
          type: "success",
          onClose: function() {
            self.callbacks.unload(self);
            self.dt.ajax.reload();
            self.dt.columns.adjust();
          },
        });
      }
    };

    self.override.update.onSuccess = (data) => {
      if (data.success) {
        self.callbacks.create.onSuccess(data);
        HoldOn.close();
        self.callbacks.unload(self);
        self.dt.ajax.reload();
        self.dt.columns.adjust();
        swal({
          title: "categoria atualizada com sucesso!",
          confirmButtonText: "OK",
          type: "success",
          onClose: function() {
            self.unload({
              refreshButtons: false,
            });
          },
        });
      }
    };
    self.callbacks.view = catView(self);
  }); //the end ??

  catGetCategories = function(params = {}) {
    const p = Object.assign(
      {
        type: "json",
      },
      params
    );

    let clean_params = { ...p };
    delete clean_params.self;

    return new Promise((resolve, reject) => {
      try {
        $.post(`${p.self.path}/list`, clean_params)
          .done((data) => {
            if (Array.isArray(data)) resolve(data);
            else
              reject({
                msg: "Category -> getCategories: invalid return data",
                data: [],
              });
          })
          .fail((err) => {
            reject({
              msg: "Category -> getCategories: error on ajax request",
              data: [],
            });
          })
          .always(() => {
            $.ajaxSettings.headers["X-CSRF-Token"] = laravel_token;
          });
      } catch (err) {
        reject({
          msg: "Category -> getCategories: error on Promise",
          data: [],
        });
      }
    });
  };

  catGetServices = function(params = {}) {
    const p = Object.assign({}, params);

    return new Promise((resolve, reject) => {
      try {
        $.ajax({ url: `${p.self.path}/services`, method: "GET" })
          .done((data) => {
            if (Array.isArray(data)) resolve(data);
            else
              reject({
                msg: "Category -> getServices: invalid return data",
                error: null,
                data: [],
              });
          })
          .fail((error) => {
            reject({
              msg: `Category -> getServices: error on ajax request`,
              error,
              data: [],
            });
          })
          .always(() => {
            $.ajaxSettings.headers["X-CSRF-Token"] = laravel_token;
          });
      } catch (error) {
        reject({
          msg: "Category -> getServices: error on Promise",
          error,
          data: [],
        });
      }
    });
  };
}

function catView(self) {
  return {
    onSuccess: function(data) {
      const d = data;

      console.log(d);
      if (d.service) self.fields.service.set(d.service.alias);
      if (d.category_id) self.fields.category.set(d.category_id);

      $("#cat_category").val(d.cat);

      if (!Array.isArray(d.config))
        $("#cat_config").val(JSON.stringify(d.config));

      if (data.erasable === 0) {
        $("#cat_erasable").aaToggle(data.erasable === 0);
        document
          .getElementById("cat_erasable")
          .setAttribute("disabled", "disabled");
      } else {
        document.getElementById("cat_erasable").removeAttribute("disabled");
        $("#cat_erasable").aaToggle(data.erasable === 0);
      }

      HoldOn.close();
    },
    onError: function(error) {
      console.log("Category -> catView ", error);
    },
  };
}
