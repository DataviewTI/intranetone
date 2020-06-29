Dropzone.autoDiscover = false;

class DropZoneLoader {
  constructor(params) {
    let p = _.defaultsDeep(params, {
      resizeMimeType: "image/jpeg",
      headers: { "X-CSRF-Token": laravel_token },
      maxFilesize: 100,
      sortable: true,
      maxSize: { w: 4000, h: 4000 },
      uploadMultiple: false,
      thumbnailMethod: "contain",
      autoProcessQueue: true,
      // dictDefaultMessage: "",
      acceptedFiles: "image/*",
      dictInvalidFileType: "INVALID FILE",
      dictMaxFilesExceeded: "MAX FILES EXCEED",
      dictFileTooBig: "FILE TOO BIG",
      dictResponseError: "RESPONSE ERROR",
      // autoQueue: true,
      url: "/dropzone/upload",
      thumbnailWidth: 800,
      thumbnailHeight: 600,
      timeout: 360000, //6min
      crop: false,
      buttons: {},
      mainImage: true,
      class: [],
      // previewsContainer: ,
      onPreviewLoad: () => {},
      onInit: () => {},
      buttons: {
        cancel: {
          name: "cancel",
          ico: "ico-close",
          tooltip: "cancelar upload",
          class: "hide-on-complete",
          bg: "#ff8000",
          action: ({ el, dz, file }) => {
            dz.removeFile(file);
          },
        },
        delete: {
          name: "delete",
          ico: "ico-trash",
          tooltip: "remover",
          icoSize: ".9rem",
          bg: "#ff8000",
          action: ({ el, dz, file }) => {
            dz.removeFile(file);
          },
        },
        reorder: {
          name: "reorder",
          ico: "ico-move",
          tooltip: "mover",
          bg: "#31dadb",
          fg: "#333",
          action: ({ el }) => {},
        },
      },
    });

    this.p = p;
    return new Dropzone(params.el, {
      ...p,
      init: function() {
        this.buttons = {};
        this.reloadImages = (data) => {
          data.group.files.forEach((img, i) => {
            try {
              var _pat = `/group/file/${img.id}/thumb?nocash=${moment().format(
                "x"
              )}`;

              var mockFile = { name: _pat, size: 0 };
              this.files.push(mockFile);

              this.emit("addedfile", mockFile);

              this.emit("thumbnail", mockFile, _pat);

              this.emit(
                "success",
                mockFile,
                JSON.stringify({
                  id: img.id,
                  file_name: img.file,
                  data: Array.isArray(img.data) ? {} : img.data,
                  name: img.file,
                  tmp_name: "",
                  mimetype: img.mimetype,
                })
              );

              // this.files[i].infos = {
              //   data: img.data,
              //   name: img.file,
              //   mimetype: img.mimetype,
              //   id: img.id,
              // };

              //força receber dz-complete
              this.emit("complete", mockFile);

              //atualiza o thumb size se existir
              if (data.sizes !== undefined) {
                //              let __sizes = JSON.parse(data.sizes.replace(/&quot;/g,'"'));
                let __sizes = data.sizes;
                (this.copy_params.sizes.thumb.w = __sizes.sizes.thumb.w),
                  (this.copy_params.sizes.thumb.h = __sizes.sizes.thumb.h);
              }

              // $(this.files[i].previewElement)
              //   .find(".progress-bar")
              //   .removeClass("bg-danger")
              //   .addClass("bg-primary");
              // $(this.files[i].previewElement)
              //   .find("[data-dz-percent]")
              //   .text("");
            } catch (err) {
              console.log(err);
            }
          });
        };

        this.on("thumbnail", (file) => {
          if (p.crop && !file.cropped) this.showCropModal(file);
        });

        this.showCropModal = (file, status = false) => {
          if (file.upload !== undefined) {
            this.options.crop.file = file;
            file.cropped = status;
            this.options.crop.modal.modal("show");
          }
        };
        // transform cropper dataURI output to a Blob which Dropzone accepts
        this.dataURItoBlob = (dataURI) => {
          let byteString = atob(dataURI.split(",")[1]);
          let ab = new ArrayBuffer(byteString.length);
          let ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++)
            ia[i] = byteString.charCodeAt(i);
          return new Blob([ab], { type: "image/jpeg" });
        };

        if (p.crop) {
          $.ajax({
            url: "/dropzone/crop-modal/default",
            dataType: "html",
            _dz: $(this)[0],
          }).done((data) => {
            this.options.crop = typeof p.crop == "boolean" ? {} : p.crop;

            let crop = this.options.crop;

            crop.file = null;
            crop.modal = $(data);

            crop.modal
              .find(".zoom-in")
              .on("click", () => crop.img.data("cropper").zoom(0.1));
            crop.modal
              .find(".zoom-out")
              .on("click", () => crop.img.data("cropper").zoom(-0.1));
            crop.modal
              .find(".rotate-left")
              .on("click", () => crop.img.data("cropper").rotate(-90));
            crop.modal
              .find(".rotate-right")
              .on("click", () => crop.img.data("cropper").rotate(90));

            crop.modal.on("hidden.bs.modal", () => {
              if (!crop.file.cropped) this.removeFile(crop.file);

              crop.file = null;
              crop.modal.find(".image-container").html("");
            });

            crop.modal.on("show.bs.modal", (e) => {
              const reader = new FileReader();
              var $img = $('<img style="max-width: 100%;"/>').css({
                opacity: 0,
              }); //prevent flick

              reader.onloadend = () => {
                crop.modal.find(".image-container").html($img);
                $img.attr("src", reader.result);
                crop.ready(crop);

                const aspecRatio = crop.aspect_ratio_x / crop.aspect_ratio_y;

                $img.cropper({
                  viewMode: 0,
                  dragMode: "move",
                  aspectRatio: aspecRatio,
                  movable: false,
                  cropBoxResizable: crop.cropBoxResizable || false,
                });
                crop.img = $img;
              };
              reader.readAsDataURL(crop.file);
            });

            crop.modal.find(".crop-upload").on("click", () => {
              const blob = crop.img.cropper("getCroppedCanvas").toDataURL();
              const newFile = this.dataURItoBlob(blob);
              newFile.name = crop.file.name;
              this.removeFile(crop.file);
              this.options.crop.file = newFile;
              this.options.crop.file.cropped = true;
              this.addFile(newFile);
              this.processQueue();
              crop.modal.modal("hide");
            });

            crop.aspect_ratio_x = p.crop.aspect_ratio_x || 1;
            crop.aspect_ratio_y = p.crop.aspect_ratio_y || 1;
            crop.ready = p.crop.ready || (() => {});
          });
        } //end crop

        this.copy_params = params.copy_params || { original: true, sizes: {} };

        //set thumb images as default
        if (this.copy_params.sizes !== {})
          this.copy_params.sizes["thumb"] = {
            w: this.options.thumbnailWidth,
            h: this.options.thumbnailHeight,
          };

        //this.modal = $(this.element).parent().find('.modal.fade').prop('id','_'+getRandomString(10));

        $.ajax({
          url: "/dropzone/preview-template/default",
          dataType: "html",
          _dz: $(this)[0],
        }).done((data) => {
          let template = getElement(data);

          // template.style.width = `${this.options.thumbnailWidth}px`;
          // template.style.height = `${this.options.thumbnailHeight}px`;
          template.querySelector(
            ".dz-img-container"
          ).style.width = `${this.options.thumbnailWidth}px`;
          template.querySelector(
            ".dz-img-container"
          ).style.height = `${this.options.thumbnailHeight}px`;

          p.class.forEach((c) => {
            template.classList.add(c);
          });

          // if (p.mainImage == false) $prv.addClass("no-main-image");
          // if (p.class !== undefined) $prv.addClass(p.class);

          this.options.previewTemplate = template.outerHTML;

          //adiciona botões extras ou remove
          if (!p.sortable) delete p.buttons.reorder;
          for (let b in p.buttons) {
            const el = p.buttons[b];

            if (typeof el === "object" && el !== null) {
              try {
                this.addButton(el);
              } catch (err) {
                console.log("não foi possível adicionar o botão", err);
              }
            }
            // if (p.buttons[b] == false) {
            //   $prv.find(`.dz-${b}`).addClass("d-none");
            // } else {
            //   $prv.find(`.dz-${b}`).removeClass("d-none");
            //   p.buttons[b].name = `dz-${b}`;
            // }
          }

          // $prv.css({
          //   width: `${this.options.thumbnailWidth}px`,
          //   height: `${this.options.thumbnailHeight}px`,
          // });

          if (![false, undefined].includes(p.buttons.edit)) {
            $.ajax({
              url: "/dropzone/edit-modal/default",
              dataType: "html",
              _dz: $(this)[0],
            })
              .done((data) => {
                let default_info = {
                  name: "dz-edit",
                  tooltip: "informações da imagem",
                  ico: "ico-edit",
                  action: (file) => {
                    this.addModal(
                      {
                        obj: $(
                          `#${(typeof p.buttons.edit === "object" &&
                            p.buttons.edit.modal) ||
                            "default-info-modal"}`
                        ),
                        file,
                        onShow: (_file, modal) => {
                          const thumb = _file.previewElement.querySelector(
                            "[data-dz-thumbnail]"
                          );

                          let img = modal.querySelector(
                            "[dz-info-modal='img']"
                          );
                          img.parentNode.style.height = `${this.options.thumbnailHeight}px`;
                          img.parentNode.style.width = `${this.options.thumbnailWidth}px`;
                          img.style.height = `${thumb.height}px`;
                          img.style.width = `${thumb.width}px`;
                          img.src = thumb.src;

                          modal.querySelector(".dz-info-caption").value =
                            _file.infos.data.caption || "";

                          modal.querySelector(".dz-info-details").value =
                            _file.infos.data.details || "";

                          let _date = modal.querySelector(".dz-info-date");

                          $(_date)
                            .pickadate({ container: document.body })
                            .pickadate("picker")
                            .clear();

                          if (
                            ![null, undefined, ""].includes(
                              _file.infos.data.date
                            )
                          )
                            $(_date)
                              .pickadate("picker")
                              .set("select", _file.infos.data.date, {
                                format: "yyyy-mm-dd",
                              });
                        },

                        onSave: (_file, modal) => {
                          let _date = modal.querySelector(".dz-info-date");

                          _file.infos.data.caption = modal.querySelector(
                            ".dz-info-caption"
                          ).value;

                          _file.infos.data.date = $(_date)
                            .pickadate("picker")
                            .get("select", "yyyy-mm-dd");

                          _file.infos.data.details = modal.querySelector(
                            ".dz-info-details"
                          ).value;

                          $(modal).modal("hide");
                        },
                      },
                      file
                    );
                  },
                };

                if (typeof p.buttons.edit === "object") {
                  default_info = Object.assign(default_info, p.buttons.edit);
                }

                $("body").append($(data));
                this.addButton(default_info);
              })
              .fail((err) => {
                console.log("erro no /dropzone/edit-modal/default");
              });
          }

          if (this.options.sortable) {
            Sortable.create(this.element, {
              animation: 500,
              easing: "cubic-bezier(1, 0, 0, 1)",
              handle: ".dz-btn-reorder",
              draggable: ".custom-dz-template",
            });
          }

          this.options.onPreviewLoad(); //this as param
          this.options.onInit(); //this as param
        });

        this.getOrderedDataImages = () => {
          const imgs = this.element.querySelectorAll(".dz-image-preview");

          Array.from(imgs).map((el, i) => {
            let _f = this.files.find((f) => {
              return f.infos.unique === el.id;
            });

            if (_f != null) _f.order = i + 1;
            return true;
          });

          return this.files
            .sort(function(a, b) {
              return a.infos.order > b.infos.order;
            })
            .map((el) => {
              return el.infos;
            });
        };

        this.addButton = function(params) {
          let p = Object.assign(
            {
              name: `${getRandomString(5)}`,
              bg: "green",
              fg: "#fff",
              class: "",
              tooltip: null,
              ico: "ico-save",
              icoSize: null,
              action: (file) => {},
            },
            params
          );

          const btn = getElement(
            `<span style = "background-color:${p.bg}" 
                ${p.tooltip !== null ? `title='${p.tooltip}'` : ""}
                class='d-flex dz-btn dz-btn-${p.name} ${p.class}'
                data-toggle='tooltip'
                data-placement='top'
                data-name='${p.name}'
              >
              <i style="color:${p.fg}; ${
              p.icoSize !== null ? `font-size:${p.icoSize}!important` : ""
            }" class = 'm-auto ico ${p.ico}'></i>
            </span>`
          );

          let template = getElement(this.options.previewTemplate);

          template.querySelector(".dz-buttons-container").append(btn);

          this.options.previewTemplate = template.outerHTML;
          this.buttons[p.name] = p;
        };

        this.addModal = function(params, _f) {
          let p = Object.assign(
            {
              obj: "string",
            },
            params
          );

          let obj = typeof p.obj == "string" ? $(`#${p.id}`) : p.obj;

          if (typeof obj.modal !== "function") obj.modal("show");
          else {
            obj
              .modal({
                show: false,
                keyboard: false,
                backdrop: "static",
                onShow: () => {},
                onSave: () => {},
              })
              .on("show.bs.modal", (e, a) => {
                const modal = e.currentTarget;
                p.onShow(_f.file, modal);
                let btnsave = e.currentTarget.querySelector(
                  "[dz-info-modal='btn-save']"
                );

                // //força a remoção dos listeners
                let clone = btnsave.cloneNode(true);
                btnsave.parentNode.replaceChild(clone, btnsave);

                clone.addEventListener("click", (e) => {
                  p.onSave(_f.file, modal);
                });

                // .on("click", function() {

                // obj.find("[id*='dz-info-']").each((a, b) => {
                //   let _inp = $(b);
                //   let _inp_name = _inp
                //     .attr("id")
                //     .substr(_inp.attr("id").lastIndexOf("-") + 1);
                //   let _name = obj
                //     .attr("id")
                //     .substr(0, obj.attr("id").indexOf("-"));
                //   _inp.val(p.file.infos.data[_name][_inp_name]);
                // });
                // obj.find("[dz-info-modal='btn-save']").on("click", function() {
                //   //percorre todos os elementos do form
                //   obj.find("[id*='dz-info-']").each((a, b) => {
                //     let _inp = $(b);
                //     let _inp_name = _inp
                //       .attr("id")
                //       .substr(_inp.attr("id").lastIndexOf("-") + 1);
                //     let _name = obj
                //       .attr("id")
                //       .substr(0, obj.attr("id").indexOf("-"));
                //     p.file.infos.data[_name][_inp_name] = _inp.val();
                //   });
                //   p.onSave(p.file, obj);
                //   setTimeout(() => {
                //     $(p.file.previewElement)
                //       .find("[data-dz-embed-data]")
                //       .val(JSON.stringify(p.file.infos));
                //   }, 300);
                //   obj.modal("hide");
                // });
              })
              .on("shown.bs.modal", (e) => {
                obj
                  .find("[id*='dz-info-']")
                  .first()
                  .focus();
              })
              .on("hidden.bs.modal", (e) => {
                obj.off("show.bs.modal");
                obj.find("[dz-info-modal='btn-save']").off("click");
              });

            obj.modal("show");
          }
        };

        $("<input type = 'hidden' name = '__dz_images'/>").appendTo(
          $(this.element).parent()
        );
        $("<input type = 'hidden' name = '__dz_copy_params'/>").appendTo(
          $(this.element).parent()
        );

        this.on("uploadprogress", (file, progress) => {
          let pg = file.previewElement.querySelector(".progress-bar");
          pg.style.width = `${progress.toFixed(2)}%`;
        });

        this.on("thumbnail", (file) => {
          if (
            file.width > this.options.maxSize.w ||
            file.height > this.options.maxSize.w
          ) {
            toastr["error"](
              `As dimensões do arquivo (${file.width}x${file.height}) excedem o máximo permitido pelo servidor , ${this.options.maxSize.w}x${this.options.maxSize.h}px de tamanho`
            );
            this.removeFile(file);
          }
          $("[data-toggle='tooltip']").tooltip();
        });

        //events listening

        this.on("success", (file, r) => {
          const img = JSON.parse(r);
          file.infos = {
            id: img.id || null,
            unique: _.uniqueId("dzthumb_"),
            name: img.file_name,
            mimetype: img.mimetype,
            tmp: img.tmp_name,
            order: img.order || this.files.length,
            data: img.data || {},
          };

          file.previewElement.id = file.infos.unique;
        });

        this.on("addedfile", function(file) {
          file.infos = {
            id: null,
            name: null,
            mimetype: null,
            tmp: null,
            order: 0,
            data: {},
          };
          const prv = file.previewElement;

          for (let b in this.buttons) {
            let btn = this.buttons[b];

            prv
              .querySelector(`.dz-buttons-container .dz-btn-${btn.name}`)
              .addEventListener("click", (e) => {
                this.buttons[e.currentTarget.getAttribute("data-name")].action({
                  el: e.currentTarget,
                  dz: this,
                  file,
                });
              });
            //remove o tooltip
            prv
              .querySelector(`.dz-buttons-container .dz-btn-${btn.name}`)
              .addEventListener("mousedown", (e) => {
                $(e.currentTarget.parentNode)
                  .find("[data-toggle='tooltip']")
                  .tooltip("hide");
              });
          }

          if (this.files.length) this.element.classList.add("has-childs");
        });

        this.on("removedfile", function(file) {
          if (!this.files.length) this.element.classList.remove("has-childs");
        });

        // this.on("addedfile", function(file) {
        //   console.log("added", file);
        //   file.infos = {
        //     id: null,
        //     name: null,
        //     mimetype: null,
        //     tmp: null,
        //     order: 0,
        //     data: {},
        //   };

        //   for (let b in this.buttons)
        //     if (this.buttons[b].action !== undefined) {
        //       let _name = b.substr(b.indexOf("-") + 1);
        //       let _obj = $(`#${_name}-modal`);
        //       file.infos.data[_name] = {};
        //       _obj.find("[id*='dz-info-']").each((a, b) => {
        //         let _inp = $(b);
        //         let inp_name = _inp
        //           .attr("id")
        //           .substr(_inp.attr("id").lastIndexOf("-") + 1);
        //         file.infos.data[_name][inp_name] = "";
        //       });

        //       $(file.previewElement)
        //         .find(`.${b}`)
        //         .on("click", function(e) {
        //           this.buttons[b].action(file);
        //         });
        //     }

        //   $(file.previewElement)
        //     .find(".dz-cancel")
        //     .on("click", function() {
        //       swal({
        //         title: "Cancelar Upload",
        //         text:
        //           "Tem certeza que deseja cancelar o upload da imagem acima?",
        //         imageUrl: $(file.previewElement)
        //           .find("[data-dz-thumbnail]")
        //           .attr("srca"),
        //         imageAlt: "Custom image",
        //         showCancelButton: true,
        //       }).then((result) => {
        //         if (result.value == true) {
        //           this.removeFile(file);
        //         }
        //       });
        //     });

        //   // $(file.previewElement)
        //   //   .find(".dz-delete")
        //   //   .on("click", (e) => {
        //   //     swal({
        //   //       title: "Apagar Imagem",
        //   //       text: "Tem certeza que deseja apagar a imagem acima?",
        //   //       imageUrl: $(file.previewElement)
        //   //         .find("[data-dz-thumbnail]")
        //   //         .attr("src"),
        //   //       imageAlt: "Custom image",
        //   //       showCancelButton: true,
        //   //     }).then((result) => {
        //   //       if (result.value == true) {
        //   //         this.removeFile(file);
        //   //       }
        //   //     });
        //   //   });

        // if (params.addedFile !== undefined) params.removedFile(file);
        // });

        // this.on("removedfile", function(file) {
        //   if (this.files.length)
        //     this.options.el.classList.add("dz-drop-files-here");
        //   if (this.options.removedFile !== undefined)
        //     this.options.removedFile(file);
        // });
        //NO EVENTO
      },
      renameFile: (file) => {
        var ext = file.name.substr(file.name.lastIndexOf(".")).toLowerCase();
        var str = getRandomString(16) + ext;
        return str;
      },
      dzDelete: (file) => {
        console.log("executa a ação do remove", file);
      },
    }).on("error", function(file, err) {
      var _this = this;
      switch (err) {
        case "INVALID FILE":
          toastr["error"](
            "São aceitas somente imagens PNG, JPG e GIF",
            `Imagem Inválida!`
          );
          this.removeFile(file);
          break;
        case "FILE TOO BIG": //{{filesize}} and {{maxFilesize}}
          toastr["error"](
            `O tamanho da imagem não pode ser superior a <strong>${_this.options.maxFilesize.toFixed(
              1
            )}mb</strong>`,
            `Imagem <strong>${file.name}</strong> Inválida!`
          );
          _this.removeFile(file);
          break;
        case "RESPONSE ERROR": //{{statusCode}}
          toastr["error"]("Erro de resposta", "erro de resposta");
          _this.removeFile(file);
          break;
      }
    });
    this.dzDelete = (file) => {
      console.log("executa a ação do remove", file);
    }; // xxx = (file) => {
  }
}
