Dropzone.autoDiscover = false;

class DropZoneLoader{
  constructor(params,callback){
      var __this = new Dropzone(params.id,{ 
      autoDiscover : params.autoDiscover || false,
      headers : params.header || {'X-CSRF-Token': laravel_token},
      thumbnailMethod : params.thumbnailMethod || 'crop',
      parallelUploads : params.parallelUploads || 64,
      maxFilesize : params.maxFilesize || 100, 
      uploadMultiple : params.uploadMultiple || false,
      dictDefaultMessage : params.ictDefaultMessage || "",
      acceptedFiles : params.acceptedFiles || 'image/*',
      dictInvalidFileType : "INVALID FILE",
      dictMaxFilesExceeded : "MAX FILES EXCEED",
      dictFileTooBig : 'FILE TOO BIG',
      dictResponseError : 'RESPONSE ERROR',
      autoQueue : params.autoQueue || true,
      clickable : params.clickable || true,
      url:"/dropzone/upload",
      thumbnailWidth: params.thumbnailWidth || 800,
      thumbnailHeight: params.thumbnailHeight || 600,
      previewsContainer:params.id,
      init:function(){
        this.reloadImages = function(data){
          console.log(data);

          data.group.files.forEach(function(img,i){
            var _pat = "/group/file/"+img.id+"/thumb?nocash="+moment().format('x');
            var mockFile = {name:_pat, size: 0 };
            _this.files.push(mockFile);
            _this.emit("addedfile",mockFile);
            _this.files[i].infos = {
              name:img.file,
              caption:img.caption,
              details:img.details,
              mimetype:img.mimetype,
              link:img.link,
              date: img.date,
              id : img.id
            }
            __this.emit("thumbnail",mockFile,_pat);
            __this.emit("success",mockFile,JSON.stringify({
              'file_name':img.file,
              'tmp_name':'',
              'mimetype':img.mimetype,
            }));
            __this.emit('uploadprogress',mockFile,100);

            //atualiza o thumb size se existir
            if(data.sizes !== undefined){
              let __sizes = JSON.parse(data.sizes.replace(/&quot;/g,'"'));
              __this.copy_params.sizes.thumb.w = __sizes.sizes.thumb.w,
              __this.copy_params.sizes.thumb.h = __sizes.sizes.thumb.h
            }

            //muda o layout para previews de update
            $(__this.files[i].previewElement).find('[data-dz-thumbnail]').css({
              width:__this.copy_params.sizes.thumb.w,
              height:__this.copy_params.sizes.thumb.h,
            });
    
            $(__this.files[i].previewElement).find('.progress-bar').removeClass('bg-danger').addClass('bg-primary');
            $(__this.files[i].previewElement).find('[data-dz-percent]').text('');
          });
        };

        this.copy_params	= params.copy_params || {original:true,sizes:{}}
        //set thumb images as default
        if(this.copy_params.sizes!=={})
          this.copy_params.sizes['thumb']={w:this.options.thumbnailWidth,h:this.options.thumbnailHeight}

        this.modal = $(this.element).parent().find('.modal.fade').prop('id','_'+getRandomString(10));

        $.ajax({
          url:'/dropzone/preview-template/default',
          dataType:'html',
          _dz:$(this)[0],
          success: function(data){
              this._dz.options.previewTemplate = data;
            }
        });
            
        this.getOrderedDataImages = function(){
          var _files = [];
          $(this.element).find('.custom-dz-template.dz-success.dz-image-preview input[data-dz-embed-data]').each(function(a,b){
            var obj = JSON.parse($(b).val());
                obj.order=a+1;
                _files.push(obj);
          });
          return _files;
        }

        $(document.createElement('input')).attr('name','__dz_images').prop('type','hidden').appendTo($(this.element).parent());
        $(document.createElement('input')).attr('name','__dz_copy_params').prop('type','hidden').appendTo($(this.element).parent());
        
        var _this = this;
        this.on("thumbnail", function(file){
          // Do the dimension checks you want to do
          if(file.width > 4000 || file.height > 4000) 
          {
            toastr["error"]("As dimensões do arquivo ("+(file.width+'x'+file.height)+") excedem o máximo permitido pelo servidor , < 4000px na altura e largura");
            _this.removeFile(file);
          }
            $("[data-toggle='tooltip']").tooltip();
          });	
      }, 
      renameFile:function(file){
        var ext = file.name.substr(file.name.lastIndexOf('.')).toLowerCase();
        var str = getRandomString(16)+ext;
        return str;
      },
    }).on('removedfile',function(file){
        if(this.files.length==0)
        $(params.id).addClass('dz-drop-files-here');
        if(params.removedFile !== undefined)
          params.removedFile(file);
    }).on('addedfile',function(file){	
      
      file.infos = {'caption':null,'date':null,'link':null,'details':null,'mimetype':null,'name':null,'tmp':null,'id':null,order:0}
      
      $(file.previewElement).find('.dz-cancel').on('click',function(){
        swal({
          title:"Cancelar Upload",
          text:"Tem certeza que deseja cancelar o upload da imagem acima?",
          imageUrl: $(file.previewElement).find('[data-dz-thumbnail]').attr('srca'),
          imageAlt: 'Custom image',
          showCancelButton: true,
          })
          .then((result) => {
            if (result.value==true) {
              __this.removeFile(file);
            }
          })
      })

      $(file.previewElement).find('.dz-delete').on('click',function(){
        swal({
          title:"Apagar Imagem",
          text:"Tem certeza que deseja apagar a imagem acima?",
          imageUrl: $(file.previewElement).find('[data-dz-thumbnail]').attr('src'),
          imageAlt: 'Custom image',
          showCancelButton: true,
          }).then((result) => {
            if (result.value==true) {
              __this.removeFile(file);
            }
          })
      });
      
      if(this.files.length)
        $(params.id).removeClass('dz-drop-files-here');

      if(params.addedFile !== undefined)
        params.removedFile(file);

    })
    .on('success',function(file,ret){
      var _ret = JSON.parse(ret);
      file.infos.name = _ret.file_name;
      file.infos.tmp = _ret.tmp_name;
			file.infos.mimetype = _ret.mimetype;
      
      var _preview = $(file.previewElement);
      var _modal = this.modal;

      //file.infos.mimetype = file.type;
      _preview.find("[data-dz-name]").text(file.infos.name);
      
      _preview.find('.dz-cancel').on('click',function(){
          this.cancel();
      });
        _preview.find('.dz-edit').on('click',function(){
        _modal.modal({
          show:false,
          keyboard:false,
          backdrop:'static',
        })
        .on('show.bs.modal', function (e){
          var img = $("[dz-info-modal='img']");
          img.prop('src',_preview.find('[data-dz-thumbnail]').attr('src'));
          $("[dz-info-modal='date']").pickadate({
            container:document.body,
          });
          
          img.prop('src',_preview.find('[data-dz-thumbnail]').attr('src'));
          $(this).find("[dz-info-modal='caption']").val(file.infos.caption);				
          $(this).find("[dz-info-modal='details']").val(file.infos.details);				
          $(this).find("[dz-info-modal='link']").val(file.infos.link);				
          
          if(file.infos.date == null || file.infos.date == '')
            $(this).find("[dz-info-modal='date']").pickadate('picker').clear();
          else
            $(this).find("[dz-info-modal='date']").pickadate('picker').set('select',file.infos.date, { format: 'yyyy-mm-dd' });
          
          $(this).find("[dz-info-modal='btn-save']").on('click',function(){
            file.infos.caption = _modal.find("[dz-info-modal='caption']").val();
            file.infos.details = _modal.find("[dz-info-modal='details']").val();
            file.infos.link = _modal.find("[dz-info-modal='link']").val();
            file.infos.date = _modal.find("[dz-info-modal='date']").pickadate('picker').get('select','yyyy-mm-dd');
            _modal.modal('hide');
          
            
            setTimeout(function(){
              _preview.find('[data-dz-embed-data]').val(JSON.stringify(file.infos));
            },300);
          
          });
        })
        .on('shown.bs.modal', function (e){
          $(this).find("[dz-info-modal='caption']").focus();
        })
        .on('hidden.bs.modal', function (e){
          $(this).off('show.bs.modal');
          $(this).find("[dz-info-modal='btn-save']").off('click');
        });
        
        _modal.modal('show');

      }).removeAttr('disabled');

      //hack to can retrieve infos os adition
      setTimeout(function(){
        _preview.find('[data-dz-embed-data]').val(JSON.stringify(file.infos));
        if(params.onSuccess !== undefined)
          params.onSuccess(file,ret);
      },300);
      
    }).on('uploadprogress',function(file,progress){
      var el = $(file.previewElement);
      el.find(".progress-bar").css({'width':progress.toFixed(2)+'%'});
      el.find("[data-dz-percent]").text((progress.toFixed(2))+'%');
      $('.btn-next').prop('disabled','disabled');
      
      if(progress >= 100){
        el.find("[data-dz-percent]").text(el.find(".dz-info-file-size").text());
        el.find(".progress-bar").removeClass('progress-bar-animated progress-bar-striped')//.addClass('bg-info');
        el.find(".dz-reorder, .dz-delete, .dz-edit").removeClass('invisible')
        el.find(".dz-cancel").css({'display':'none'});
        el.find(".dz-img-container").removeClass('dz-img-loading')
        $('.btn-next').removeAttr('disabled');
      }
      else
        el.find("[data-dz-name]").text('carregando...');
    })
    .on('error',function(file,err){
      var _this = this;
      switch(err)
      {
        case "INVALID FILE": 
          toastr["error"]("São aceitas somente imagens PNG, JPG e GIF", "Imagem <strong>"+(file.name)+"</strong> Inválida!")
          _this.removeFile(file);
          break;
        case "FILE TOO BIG": //{{filesize}} and {{maxFilesize}}
          toastr["error"]("O tamanho da imagem não pode ser superior a <strong>"+((_this.options.maxFilesize).toFixed(1))+'mb</strong>', "Imagem <strong>"+(file.name)+"</strong> Inválida!")
          _this.removeFile(file);
          break;
        case "RESPONSE ERROR": //{{statusCode}}
          toastr["error"]("AASA","aa")
          _this.removeFile(file);
          break;
      }
    });



    return __this;
  }
}