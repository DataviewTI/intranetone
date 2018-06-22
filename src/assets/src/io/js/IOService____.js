/** default CRUD operations to all Service Classes ******************************************************/
/** Separar o DVService em outro arquivo*/
//ESSA CLASSE QUE DÁ O ERRO DO WEBPACK 

class IOService{
  constructor(params,callback){
      this.toView=null;
      this.tabs={};
      this.defaults = {ajax:null}
      this.name=params.name;
      this.path=params.name.toLowerCase(),
      this.dt = null,
      this.fv=null;
      this.dz=null;
      this.df=$('#default-form');
      this.wz=$('#default-wizard').wizard();
      this.callbacks={
        view:{onSuccess:()=>{},onError:()=>{}},
        create:{onSuccess:()=>{},onError:()=>{}},
        update:{onSuccess:()=>{},onError:()=>{}},
        delete:{onSuccess:()=>{},onError:()=>{}},
        unload:()=>{}
      };
      var self = this;
  
      $(document).ready(()=>{
        //config tabshow events
        $("a[data-toggle='tab'").each((i,obj)=>{
          self.tabs[$(obj).attr('__name')] = {
            tab:$(obj),
            setState:(val)=>{
              this.tab.attr('__update',val);
              return this;
            },
            getState:()=>{
              return this.tab.attr('__update');
            },
          }
        });
        
        //futuramente trocar por um has_table
        $(document).on('shown.bs.tab', 'a[data-toggle="tab"]',(e)=>{
          if($(e.target).attr('__update') == 'true'){
            self.dt.ajax.reload();
            $(e.target).attr('__update',false);
          }
          if($(e.target).attr('__name') == 'listar')
            self.dt.columns.adjust();
        });


        $('.btn-new').on('click',(e)=>{
          swal({
            title:"Novo Registro",
            text:"Deseja iniciar o cadastro de um novo registro?",
            showCancelButton:true,
            type:"question",
            }).then(()=>{
              self.unload(self);
              self.callbacks.unload(self);
              setTimeout(()=>{
                self.tabs['cadastrar'].tab.tab('show');
                self.df.find("input:enabled,input:enabled").first().focus();
              },100);
              //document.location.reload();
            })
          });

        
        //corrige bug da nav-tab mostrar 2 actives
        $('a[data-toggle="tab"]').on('show.bs.tab',(e)=>{
          let ntab = $(e.target);
          let ptab = $(e.relatedTarget);
          $(ptab.attr('href')).removeClass('active');
          $(ntab.attr('href')).addClass('active');
        })


      callback(self);
    });

    //methods
    /** DEFAULT Wizard actions*/
    this.wizardActions = (callback)=>{
      this.wz.keys={
        fv: this.df.data('formValidation'),
        numtabs:this.df.find('.step-pane').length,
      }
      
      if(this.wz.keys.numtabs==1){
        $(".btn-next").addClass('btn-success').addClass("btn-success");
        $(".btn-next .ico").removeClass('ico-arrow-right').addClass("ico-save");
      }

      //do is necessary?
      let self = this;
      return self.wz.on('actionclicked.fu.wizard',(e, data)=>{
        self.fv.caller = 'wizard';
        self.wz.keys.step = data.step;
        self.wz.keys.container = self.df.find(`.step-pane[data-step="${self.wz.keys.step}"]`);
        self.wz.keys.fv.validateContainer(self.wz.keys.container);
        //??global or not?
        var isValidStep = self.wz.keys.fv.isValidContainer(self.wz.keys.container);
        
        //saindo do penúltimo para o último
        if(self.wz.keys.step==self.wz.keys.numtabs-1 && isValidStep){
          $(".btn-next").addClass('btn-success');
          $(".btn-next .ico").removeClass('ico-arrow-right').addClass("ico-save");
        }

        //voltando do último para o penúltimo
        if(self.wz.keys.step==self.wz.keys.numtabs && data.direction == 'previous' && isValidStep){
          $(".btn-next").removeClass('btn-success').addClass("btn-secondary");
          $(".btn-next .ico").removeClass('ico-save').addClass("ico-arrow-right");
        } 

        if (isValidStep === false || isValidStep === null){
          e.preventDefault();
        }
      })

      .on('finished.fu.wizard',(e)=>{

        var isValidStep = self.wz.keys.fv.isValidContainer(self.wz.keys.container);
        callback();
        //prepare extra data to submit
        if(isValidStep === true){
          if(self.toView != null){
            self.update(self.toView);
          }
          else{

            $.ajax({
              url: self.wz.keys.fv.$form.attr('action'),
              method: 'POST',
              data: self.wz.keys.fv.$form.serializeArray(),
              beforeSend:()=>{
                HoldOn.open({message:"Salvando dados, aguarde...",theme:'sk-bounce'});
              },
              success:(data)=>{
                if(data.success)
                {
                  self.tabs['listar'].setState(true);
                  self.callbacks.create.onSuccess(data);
                  HoldOn.close();
                  swal({
                    title:"Cadastro efetuado com sucesso!",
                    confirmButtonText:'OK',
                    type:"success",
                    onClose:()=>{
                      self.unload(self);
                    }
                  });
                }
              },
              error:(ret)=>{
                self.defaults.ajax.onError(ret,self.callbacks.create.onError);
              }
            });//end ajax
          }//endelse
        }
      }).
      on('stepclicked.fu.wizard',(e, data)=>{
        if(data.step!==self.wz.keys.numtabs){
          $(".btn-next").removeClass('btn-success');
          $(".btn-next .ico").removeClass('ico-save').addClass("ico-arrow-right");
        }
      });
    }

    //CRUD Actions

    this.view = (id)=>{

      //unload o service antes por padrão!!
      this.unload(this);
      self = this;
      $.ajax({
        url:self.path+"/view/"+id,
        beforeSend:()=>{
          HoldOn.open({message:"Carregando dados, aguarde...",theme:'sk-bounce'});
        },
        success:(ret)=>{

          if(ret.success){
            var data = ret.data[0];
            self.toView = data.id;
            $('.btn-info-edit').css({'display':'inline'}).find('.badge').text(data.id);
            
            self.callbacks.view.onSuccess(data);
            
            setTimeout(()=>{
              self.tabs['cadastrar'].tab.tab('show');
              HoldOn.close();
              //focus on first enabled element, to fix placeholder glitch
              self.df.find("input:enabled,input:enabled").first().focus();
            },500);
          }
        },
        error:(ret)=>{
          self.defaults.ajax.onError(ret,self.callbacks.view.onError);
          HoldOn.close();
        }
      });
    }

    //update
    this.update = (id)=>{
      self = this;
      $.ajax({
        method: 'POST',
        url:self.path+"/update/"+id,
        cache:false,
        dataType: "json",
        data: self.wz.keys.fv.$form.serializeArray(),
        beforeSend: ()=>{
          HoldOn.open({message:"Atualizando dados, aguarde...",theme:'sk-bounce'});
        },
        success:(ret)=>{
          HoldOn.close();
          if(ret.success){
            //set list tab as updatable
            self.tabs['listar'].setState(true);
            self.callbacks.update.onSuccess(ret);
            swal({
              title:"Sucesso",
              text:"O registro foi atualizado com sucesso!",
              type:"success",
              confirmButtonText:'OK',
              onClose:()=>{
                self.unload(self);
              }
            });
          }
        },      
        error:(ret)=>{
          self.defaults.ajax.onError(ret,self.callbacks.update.onError);
        }
      });
    }

    //update
    this.delete = (id)=>
    {
      swal.queue([{
        title:"Excluir Registro?",
        html:"Ao executar esta ação <b>todas as informações vinculadas a este registro serão perdidas</b>, confirma a exclusão?",
        type:"question",
        confirmButtonText:"<i class = 'ico ico-thumbs-up'></i> Sim, confirmo",
        cancelButtonText:"<i class = 'ico ico-thumbs-down'></i> Não, cancelar",
        showCancelButton: true,
        reverseButtons:true,
        showLoaderOnConfirm: true,
        preConfirm:()=>{
          return new Promise((resolve)=>{
            $.get(`${self.path}/delete/+${id}`)
              .done((ret)=>{
                
                if(ret.sts == true)
                {
                  swal.insertQueueStep({
                    title:"Registro excluído!",
                    html:`O registro <b>${id}</b> foi excluído do sistema!`,
                    type:"success"
                  })
                }
                else
                  swal.insertQueueStep({
                      title:"Ocorreram problemas, o registro não pode ser removido!",
                        type:"error",
                  });
                  
                self.dt.ajax.reload();
                self.dt.draw(true);
                resolve();
              })
              .fail((ret)=>{
                if(ret.status == 403){
                  var data = JSON.parse(ret.responseText);
                  for(var err in data.errors){
                    toastr["error"](data.errors[err]);
                  }
                }
                resolve();
              })
          })
        }
      }]);
    }
    
    //update
    this.unload = (self)=>{
      //verifica se a aba é a última
      //if(self.wz.wizard('selectedItem') == self.wz.keys.numtabs){
        $(".btn-next").removeClass('btn-success').addClass('btn-primary').get();
        $(".btn-next .ico").removeClass('ico-save').addClass("ico-arrow-right");
        $(".btn-next").get()[0].firstChild.nodeValue = $(".btn-next").attr('data-next');
    // }
      self.toView = null;
      self.df[0].reset();
      $('.btn-info-edit').css({'display':'none'}).find('.badge').text('');
      self.df.data('formValidation').resetForm();
      self.callbacks.unload(self);
      self.wz.wizard('selectedItem',{step:1});
      self.df.find("input:enabled").first().focus();
    }

    
    
    
    
    
    
    
    //Default CRUD ajax request onerror
    this.defaults.ajax = {
      onError:(ret,callback)=>{
        if(ret.status == 422){
          var data = JSON.parse(ret.responseText);
          HoldOn.close();
          for(var err in data.errors){
            toastr["error"](data.errors[err]);
            try{
              self.df.formValidation('updateStatus', err, 'NOT_VALIDATED')
            }
            catch(err){
              console.warn('ajax insert/update 422');
            }
          }
        }
        
        if(ret.status == 403){
          var data = JSON.parse(ret.responseText);
          HoldOn.close();
          for(var err in data.errors){
            toastr["error"](data.errors[err]);
            try{
              self.df.formValidation('updateStatus', err, 'NOT_VALIDATED')
            }
            catch(err){
              console.warn('ajax insert/update 403');
            }
          }
        }
        callback(self);
      }
    }//end ajax error
  }
}//end DVService
