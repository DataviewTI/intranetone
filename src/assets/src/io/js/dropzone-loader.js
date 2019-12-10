Dropzone.autoDiscover = false;

class DropZoneLoader {
  constructor(params, callback) {
    var __this = new Dropzone(params.id, {
      autoDiscover: params.autoDiscover || false,
      headers: params.header || { 'X-CSRF-Token': laravel_token },
      thumbnailMethod: params.thumbnailMethod || 'crop',
      parallelUploads: params.parallelUploads || 64,
      maxFilesize: params.maxFilesize || 100,
      uploadMultiple: params.uploadMultiple || false,
      dictDefaultMessage: params.ictDefaultMessage || '',
      acceptedFiles: params.acceptedFiles || 'image/*',
      dictInvalidFileType: 'INVALID FILE',
      dictMaxFilesExceeded: 'MAX FILES EXCEED',
      dictFileTooBig: 'FILE TOO BIG',
      dictResponseError: 'RESPONSE ERROR',
      autoQueue: params.autoQueue || true,
      clickable: params.clickable || true,
      maxFiles: params.maxFiles || null,
      url: '/dropzone/upload',
      thumbnailWidth: params.thumbnailWidth || 800,
      thumbnailHeight: params.thumbnailHeight || 600,
      crop: params.crop || false,
      buttons: params.buttons || {},
      mainImage: params.mainImage || true,
      previewsContainer: params.id,
      onPreviewLoad: params.onPreviewLoad || function() {},
      init: function() {
        this.buttons = {};
        this.reloadImages = data => {
          data.group.files.forEach((img, i) => {
            try {
              var _pat = `/group/file/${img.id}/thumb?nocash=${moment().format(
                'x'
              )}`;
              var mockFile = { name: _pat, size: 0 };
              _this.files.push(mockFile);
              _this.emit('addedfile', mockFile);
              _this.files[i].infos = {
                data: img.data,
                name: img.file,
                mimetype: img.mimetype,
                id: img.id
              };

              __this.emit('thumbnail', mockFile, _pat);
              __this.emit(
                'success',
                mockFile,
                JSON.stringify({
                  file_name: img.file,
                  tmp_name: '',
                  mimetype: img.mimetype
                })
              );
              __this.emit('uploadprogress', mockFile, 100);

              //atualiza o thumb size se existir
              if (data.sizes !== undefined) {
                //              let __sizes = JSON.parse(data.sizes.replace(/&quot;/g,'"'));
                let __sizes = data.sizes;
                (__this.copy_params.sizes.thumb.w = __sizes.sizes.thumb.w),
                  (__this.copy_params.sizes.thumb.h = __sizes.sizes.thumb.h);
              }

              //muda o layout para previews de update
              $(__this.files[i].previewElement)
                .find('[data-dz-thumbnail]')
                .css({
                  width: __this.copy_params.sizes.thumb.w,
                  height: __this.copy_params.sizes.thumb.h
                });

              $(__this.files[i].previewElement)
                .find('.progress-bar')
                .removeClass('bg-danger')
                .addClass('bg-primary');
              $(__this.files[i].previewElement)
                .find('[data-dz-percent]')
                .text('');
            } catch (err) {
              console.log(err);
            }
          });
        };

        this.on('thumbnail', file => {
          if (params.crop && !file.cropped) this.showCropModal(file);
        });

        this.showCropModal = (file, status = false) => {
          if (file.upload !== undefined) {
            this.options.crop.file = file;
            file.cropped = status;
            this.options.crop.modal.modal('show');
          }
        };
        // transform cropper dataURI output to a Blob which Dropzone accepts
        this.dataURItoBlob = dataURI => {
          let byteString = atob(dataURI.split(',')[1]);
          let ab = new ArrayBuffer(byteString.length);
          let ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          return new Blob([ab], { type: 'image/jpeg' });
        };
        if (params.crop) {
          $.ajax({
            url: '/dropzone/crop-modal/default',
            dataType: 'html',
            _dz: $(this)[0],
            success: function(data) {
              __this.options.crop =
                typeof params.crop == 'boolean' ? {} : params.crop;
              let __crop = __this.options.crop;

              __crop.file = null;
              __crop.modal = $(data);
              __crop.modal
                .find('.zoom-in')
                .on('click', () => __crop.img.data('cropper').zoom(0.1));
              __crop.modal
                .find('.zoom-out')
                .on('click', () => __crop.img.data('cropper').zoom(-0.1));
              __crop.modal
                .find('.rotate-left')
                .on('click', () => __crop.img.data('cropper').rotate(-90));
              __crop.modal
                .find('.rotate-right')
                .on('click', () => __crop.img.data('cropper').rotate(90));

              __crop.modal.on('hidden.bs.modal', function(e) {
                let _crop = __this.options.crop;
                if (!_crop.file.cropped) __this.removeFile(_crop.file);

                _crop.file = null;
                _crop.modal.find('.image-container').html('');
              });

              __crop.modal.on('show.bs.modal', function(e) {
                let _crop = __this.options.crop;
                var reader = new FileReader();
                var $img = $('<img style="max-width: 100%;"/>').css({
                  opacity: 0
                }); //prevent flick

                reader.onloadend = () => {
                  _crop.modal.find('.image-container').html($img);
                  $img.attr('src', reader.result);
                  _crop.ready(_crop);
                  var aspecRatio = _crop.aspect_ratio_x / _crop.aspect_ratio_y;
                  $img.cropper({
                    viewMode: 0,
                    dragMode: 'move',
                    aspectRatio: aspecRatio,
                    // autoCropArea: 1,
                    movable: false,
                    cropBoxResizable: _crop.cropBoxResizable || false
                    // minContainerWidth: 850
                  });
                  _crop.img = $img;
                };
                reader.readAsDataURL(_crop.file);
              });

              __crop.modal.find('.crop-upload').on('click', () => {
                let _crop = __this.options.crop;
                var blob = _crop.img.cropper('getCroppedCanvas').toDataURL();
                var newFile = __this.dataURItoBlob(blob);
                newFile.name = _crop.file.name;
                __this.removeFile(_crop.file);
                __this.options.crop.file = newFile;
                __this.options.crop.file.cropped = true;
                __this.addFile(newFile);
                __this.processQueue();
                _crop.modal.modal('hide');
              });

              __crop.aspect_ratio_x = params.crop.aspect_ratio_x || 1;
              __crop.aspect_ratio_y = params.crop.aspect_ratio_y || 1;
              __crop.ready = params.crop.ready || (() => {});
            }
          });
        } //end crop

        this.copy_params = params.copy_params || { original: true, sizes: {} };
        //set thumb images as default
        if (this.copy_params.sizes !== {})
          this.copy_params.sizes['thumb'] = {
            w: this.options.thumbnailWidth,
            h: this.options.thumbnailHeight
          };

        //this.modal = $(this.element).parent().find('.modal.fade').prop('id','_'+getRandomString(10));

        $.ajax({
          url: '/dropzone/preview-template/default',
          dataType: 'html',
          _dz: $(this)[0],
          success: function(data) {
            let $prv = $(data);
            if (params.mainImage == false) $prv.addClass('no-main-image');

            if (params.class !== undefined) $prv.addClass(params.class);
            //adiciona botões extras ou remove
            for (let b in params.buttons) {
              if (params.buttons[b] == false) {
                $prv.find(`.dz-${b}`).addClass('d-none');
              } else {
                $prv.find(`.dz-${b}`).removeClass('d-none');
                params.buttons[b].name = `dz-${b}`;
                __this.addButton(params.buttons[b]);
              }
            }

            __this.options.previewTemplate = $prv.get(0).outerHTML;

            if (
              __this.options.buttons.edit !== false &&
              __this.options.buttons.edit !== undefined
            ) {
              $.ajax({
                url: '/dropzone/edit-modal/default',
                dataType: 'html',
                _dz: $(this)[0],
                success: function(data) {
                  $('body').append($(data));
                  __this.addButton({
                    name: 'dz-edit',
                    ico: 'ico-edit',
                    bg: 'bg-danger',
                    tooltip: 'Editar',
                    action: file => {
                      __this.addModal({
                        obj: $('#edit-modal'),
                        file,
                        onShow: (_file, obj) => {
                          obj.find('#dz-info-date').pickadate({
                            container: document.body
                          });
                          let _date = file.infos.data.edit.date;

                          if (_date == null || _date == '')
                            obj
                              .find('#dz-info-date')
                              .pickadate('picker')
                              .clear();
                          else
                            obj
                              .find('#dz-info-date')
                              .pickadate('picker')
                              .set('select', _date, {
                                format: 'yyyy-mm-dd'
                              });
                        },
                        onSave: (_file, obj) => {
                          _file.infos.data.edit.date = obj
                            .find('#dz-info-date')
                            .pickadate('picker')
                            .get('select', 'yyyy-mm-dd');
                        }
                      });
                    }
                  });
                }
              });
            }
            __this.options.onPreviewLoad(_this);
          }
        });

        this.getOrderedDataImages = () => {
          var _files = [];
          $(this.element)
            .find(
              '.custom-dz-template.dz-success.dz-image-preview input[data-dz-embed-data]'
            )
            .each(function(a, b) {
              var obj = JSON.parse($(b).val());
              obj.order = a + 1;
              _files.push(obj);
            });
          return _files;
        };

        this.addButton = function(params) {
          //console.log('chamou o addButton');
          let $btn = $(
            "<span class='dv-btn-circle ml-1' data-toggle='tooltip' data-placement='top'>"
          );
          let $prv = $(__this.options.previewTemplate);
          //let $prv = params.prv || params.file.previewElement;
          let _name = params.name || 'dz-' + getRandomString(5);
          $btn
            .addClass(_name)
            .addClass(params.bg || 'bg-success')
            .addClass(params.fg || 'text-white')
            .addClass(params.title || '')
            .prop(`data-dz-${_name}`);
          if (params.tooltip !== undefined) $btn.prop('title', params.tooltip);

          $btn.append(`<i class = 'ico ${params.ico || 'ico-save'}'></i>`);
          $prv.find('.dz-buttons-container').append($btn);

          //update previewTemplate
          __this.options.previewTemplate = $prv.get(0).outerHTML;
          __this.buttons[_name] = params;
        };

        this.addModal = function(params) {
          let obj =
            typeof params.obj == 'string' ? $(`#${params.id}`) : params.obj;

          if (typeof obj.modal !== 'function') obj.modal('show');
          else {
            obj
              .modal({
                show: false,
                keyboard: false,
                backdrop: 'static'
              })
              .on('show.bs.modal', function() {
                let _preview = $(params.file.previewElement);
                let img = obj.find("[dz-info-modal='img']");
                img.prop(
                  'src',
                  _preview.find('[data-dz-thumbnail]').attr('src')
                );

                obj.find("[id*='dz-info-']").each((a, b) => {
                  let _inp = $(b);
                  let _inp_name = _inp
                    .attr('id')
                    .substr(_inp.attr('id').lastIndexOf('-') + 1);
                  let _name = obj
                    .attr('id')
                    .substr(0, obj.attr('id').indexOf('-'));
                  _inp.val(params.file.infos.data[_name][_inp_name]);
                });
                if (params.onShow !== undefined)
                  params.onShow(params.file, obj);

                obj.find("[dz-info-modal='btn-save']").on('click', function() {
                  //percorre todos os elementos do form
                  obj.find("[id*='dz-info-']").each((a, b) => {
                    let _inp = $(b);
                    let _inp_name = _inp
                      .attr('id')
                      .substr(_inp.attr('id').lastIndexOf('-') + 1);
                    let _name = obj
                      .attr('id')
                      .substr(0, obj.attr('id').indexOf('-'));
                    params.file.infos.data[_name][_inp_name] = _inp.val();
                  });
                  if (params.onSave !== undefined)
                    params.onSave(params.file, obj);

                  setTimeout(function() {
                    $(params.file.previewElement)
                      .find('[data-dz-embed-data]')
                      .val(JSON.stringify(params.file.infos));
                  }, 300);

                  obj.modal('hide');
                });
              })
              .on('shown.bs.modal', function(e) {
                obj
                  .find("[id*='dz-info-']")
                  .first()
                  .focus();
              })
              .on('hidden.bs.modal', function(e) {
                obj.off('show.bs.modal');
                obj.find("[dz-info-modal='btn-save']").off('click');
              });

            obj.modal('show');
          }
        };

        $("<input type = 'hidden' name = '__dz_images'/>").appendTo(
          $(this.element).parent()
        );
        $("<input type = 'hidden' name = '__dz_copy_params'/>").appendTo(
          $(this.element).parent()
        );

        var _this = this;
        this.on('thumbnail', function(file) {
          // Do the dimension checks you want to do
          if (file.width > 4000 || file.height > 4000) {
            toastr['error'](
              `As dimensões do arquivo (${file.width}x${file.height}) excedem o máximo permitido pelo servidor , < 4000px na altura e largura`
            );
            _this.removeFile(file);
          }
          $("[data-toggle='tooltip']").tooltip();
        });
      },
      renameFile: function(file) {
        var ext = file.name.substr(file.name.lastIndexOf('.')).toLowerCase();
        var str = getRandomString(16) + ext;
        return str;
      }
    })
      .on('removedfile', file => {
        if (__this.files.length == 0)
          $(params.id).addClass('dz-drop-files-here');
        if (params.removedFile !== undefined) params.removedFile(file);
      })
      .on('addedfile', function(file) {
        file.infos = {
          id: null,
          name: null,
          mimetype: null,
          tmp: null,
          order: 0,
          data: {}
        };
        for (let b in this.buttons)
          if (this.buttons[b].action !== undefined) {
            let _name = b.substr(b.indexOf('-') + 1);
            let _obj = $(`#${_name}-modal`);
            file.infos.data[_name] = {};
            _obj.find("[id*='dz-info-']").each((a, b) => {
              let _inp = $(b);
              let inp_name = _inp
                .attr('id')
                .substr(_inp.attr('id').lastIndexOf('-') + 1);
              file.infos.data[_name][inp_name] = '';
            });

            $(file.previewElement)
              .find(`.${b}`)
              .on('click', function(e) {
                __this.buttons[b].action(file);
              });
          }

        $(file.previewElement)
          .find('.dz-cancel')
          .on('click', function() {
            swal({
              title: 'Cancelar Upload',
              text: 'Tem certeza que deseja cancelar o upload da imagem acima?',
              imageUrl: $(file.previewElement)
                .find('[data-dz-thumbnail]')
                .attr('srca'),
              imageAlt: 'Custom image',
              showCancelButton: true
            }).then(result => {
              if (result.value == true) {
                console.log('removeu');
                __this.removeFile(file);
              }
            });
          });

        $(file.previewElement)
          .find('.dz-delete')
          .on('click', function() {
            swal({
              title: 'Apagar Imagem',
              text: 'Tem certeza que deseja apagar a imagem acima?',
              imageUrl: $(file.previewElement)
                .find('[data-dz-thumbnail]')
                .attr('src'),
              imageAlt: 'Custom image',
              showCancelButton: true
            }).then(result => {
              if (result.value == true) {
                __this.removeFile(file);
              }
            });
          });

        if (this.files.length) $(params.id).removeClass('dz-drop-files-here');

        if (params.addedFile !== undefined) params.removedFile(file);
      })
      .on('success', function(file, ret) {
        console.log('file', file);
        console.log('ret', ret);
        var _ret = JSON.parse(ret);

        console.log('_ret', _ret);
        file.infos.name = _ret.file_name;
        file.infos.tmp = _ret.tmp_name;
        file.infos.mimetype = _ret.mimetype;

        var _preview = $(file.previewElement);
        var _modal = this.modal;

        //file.infos.mimetype = file.type;
        _preview.find('[data-dz-name]').text(file.infos.name);

        _preview.find('.dz-crop').on('click', function() {});
        _preview.find('.dz-cancel').on('click', function() {
          this.cancel();
        });

        //hack to can retrieve infos os adition
        setTimeout(function() {
          _preview.find('[data-dz-embed-data]').val(JSON.stringify(file.infos));
          if (params.onSuccess !== undefined) params.onSuccess(file, ret);
        }, 300);
      })
      .on('uploadprogress', function(file, progress) {
        var el = $(file.previewElement);
        el.find('.progress-bar').css({ width: progress.toFixed(2) + '%' });
        el.find('[data-dz-percent]').text(progress.toFixed(2) + '%');
        $('.btn-next').prop('disabled', 'disabled');

        if (progress >= 100) {
          el.find('[data-dz-percent]').text(
            el.find('.dz-info-file-size').text()
          );
          el.find('.progress-bar').removeClass(
            'progress-bar-animated progress-bar-striped'
          ); //.addClass('bg-info');
          //el.find(".dz-reorder, .dz-delete, .dz-edit").removeClass('invisible')
          el.find('.dz-cancel').css({ display: 'none' });
          el.find('.dz-img-container').removeClass('dz-img-loading');
          $('.btn-next').removeAttr('disabled');

          /* future crop implementation on edit
          if(params.crop !== undefined && params.crop!== false){
            el.find(".dz-crop").removeClass('invisible');
        }*/
        } else el.find('[data-dz-name]').text('carregando...');
      })
      .on('error', function(file, err) {
        var _this = this;
        switch (err) {
          case 'INVALID FILE':
            toastr['error'](
              'São aceitas somente imagens PNG, JPG e GIF',
              `Imagem <strong>${file.name}</strong> Inválida!`
            );
            _this.removeFile(file);
            break;
          case 'FILE TOO BIG': //{{filesize}} and {{maxFilesize}}
            toastr['error'](
              `O tamanho da imagem não pode ser superior a <strong>${_this.options.maxFilesize.toFixed(
                1
              )}mb</strong>`,
              `Imagem <strong>${file.name}</strong> Inválida!`
            );
            _this.removeFile(file);
            break;
          case 'RESPONSE ERROR': //{{statusCode}}
            toastr['error']('Erro de resposta', 'erro de resposta');
            _this.removeFile(file);
            break;
        }
      });

    return __this;
  }
}
