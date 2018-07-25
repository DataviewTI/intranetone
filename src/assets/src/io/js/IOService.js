/** default CRUD operations to all Service Classes ******************************************************/
/** Separar o DVService em outro arquivo*/
//ESSA CLASSE QUE DÁ O ERRO DO WEBPACK 

class IOService{
  constructor(params,callback){
      console.log('SSSS');
      this.toView=null;
      this.tabs={};
      this.defaults = {ajax:null}
      this.name=params.name;
      this.path=params.name.toLowerCase(),
      this.cdt = null, //categories datatable
      this.cem = $('#categories-crud-modal'), //category edit modal
      this.createCategory = null, //service's categories 
      this.updateCategory = null, //service's categories 
      this.deleteCategory = null, //service's categories 
      this.dt = null,
      this.fv=null;
      this.dz=null;
      this.dfId = 'default-form';
      this.df=$('#'+this.dfId);
      this.wz=$('#default-wizard').wizard();
      this.callbacks={
        view:{onSuccess:function(){},onError:function(){}},
        create:{onSuccess:function(){},onError:function(){}},
        update:{onSuccess:function(){},onError:function(){}},
        delete:{onSuccess:function(){},onError:function(){}},
        unload:function(){}
      };
      var self = this;
  
      $(document).ready(function(){
        //config tabshow events
        $("a[data-toggle='tab'").each(function(i,obj){
          self.tabs[$(obj).attr('__name')] = {
            tab:$(obj),
            setState:function(val){
              this.tab.attr('__update',val);
              return this;
            },
            getState:function(){
              return this.tab.attr('__update');
            },
          }
        });
        
        //futuramente trocar por um has_table
        $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
          if($(e.target).attr('__update') == 'true'){
            self.dt.ajax.reload();
            $(e.target).attr('__update',false);
          }
          if($(e.target).attr('__name') == 'listar')
            self.dt.columns.adjust();
        });


        $('.btn-new').on('click',function (e){
          $('.btn-new').blur();
          swal({
            title:"Novo Registro",
            text:"Deseja iniciar o cadastro de um novo registro?",
            showCancelButton:true,
            type:"question",
            }).then((result)=>{
                if(result.value){ 
                  // self.cdt.ajax.reload();
                  // self.cdt.draw(true);
                  self.unload(self);
                  self.callbacks.unload(self);
                  setTimeout(function(){
                    self.tabs['cadastrar'].tab.tab('show');
                    self.df.find("input:enabled,input:enabled").first().focus();
                  },100);
                  //document.location.reload();
                }
            })
          });

        
        //corrige bug da nav-tab mostrar 2 actives
        $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
          let ntab = $(e.target);
          let ptab = $(e.relatedTarget);
          $(ptab.attr('href')).removeClass('active');
          $(ntab.attr('href')).addClass('active');
        })


      callback(self);
    });

    //methods
    /** DEFAULT Wizard actions*/
    this.wizardActions = function(callback){
      
      this.wz.keys={
        fv: this.fv,
        numtabs:this.df.find('.step-pane').length,
      }

      if(this.wz.keys.numtabs==1){
        $(".btn-next").addClass('btn-success').addClass("btn-success");
        $(".btn-next .ico").removeClass('ico-arrow-right').addClass("ico-save");
      }

      //do is necessary?
      let self = this;
      return self.wz.on('actionclicked.fu.wizard', function(e, data){
        self.fv.caller = 'wizard';
        self.wz.keys.step = data.step;
        self.wz.keys.direction = data.direction;
        self.wz.keys.container = self.df.find('.step-pane[data-step="' + self.wz.keys.step +'"]');

        if(self.wz.keys.step!=self.wz.keys.numtabs){
          e.preventDefault();
        }

        if(self.wz.keys.direction == 'previous'){
          //voltando do último para o penúltimo
          if(self.wz.keys.step==self.wz.keys.numtabs && self.wz.keys.direction == 'previous'){
            // console.log('ultimo para penultimo');
            $(".btn-next").removeClass('btn-success').addClass("btn-secondary");
            $(".btn-next .ico").removeClass('ico-save').addClass("ico-arrow-right");
          } 
          
          self.wz.wizard('selectedItem',{step:self.wz.keys.step-1});
        }else{
          //??global or not?
          var isValidStep = null;
          self.wz.keys.fv[self.wz.keys.step-1].validate().then(function(status) {
            
            if(status === 'Valid')
              isValidStep = true;
            else
              isValidStep = false; 

            //saindo do penúltimo para o último
            if(self.wz.keys.step==self.wz.keys.numtabs-1 && isValidStep){
              // console.log('penultimo para ultimo');
              $(".btn-next").addClass('btn-success');
              $(".btn-next .ico").removeClass('ico-arrow-right').addClass("ico-save");
            }

            if (isValidStep != false && isValidStep != null){
              self.wz.wizard('selectedItem',{step:self.wz.keys.step+1});
            }
              
          });
        }
        
      })
      .on('finished.fu.wizard', function(e){
        
        var isValidStep = null;
        self.wz.keys.fv[self.wz.keys.fv.length-1].validate().then(function(status) {
          if(status === 'Valid')
            isValidStep = true;
          else
            isValidStep = false; 

          callback();
          //prepare extra data to submit
          if(isValidStep === true){
            if(self.toView != null){
              self.update(self.toView);
            }
            else{

              $.ajax({
                url: self.df.attr('action'),
                method: 'POST',
                data: self.df.serializeArray(),
                beforeSend: function(){
                  HoldOn.open({message:"Salvando dados, aguarde...",theme:'sk-bounce'});
                },
                success: function(data){
                  if(data.success)
                  {
                    self.tabs['listar'].setState(true);
                    self.callbacks.create.onSuccess(data);
                    HoldOn.close();
                    swal({
                      title:"Cadastro efetuado com sucesso!",
                      confirmButtonText:'OK',
                      type:"success",
                      onClose:function(){
                        self.unload(self);
                      }
                    });
                  }
                },
                error:function(ret){
                  self.defaults.ajax.onError(ret,self.callbacks.create.onError);
                }
              });//end ajax
            }//endelse
          }
            
        });
        
      }).
      on('stepclicked.fu.wizard', function(e, data){
        
        if(data.step!==self.wz.keys.numtabs){
          $(".btn-next").removeClass('btn-success');
          $(".btn-next .ico").removeClass('ico-save').addClass("ico-arrow-right");
        }
      });
    }

    //CRUD Actions

    this.view = function(id){

      //unload o service antes por padrão!!
      this.unload(this);
      self = this;
      $.ajax({
        url:self.path+"/view/"+id,
        beforeSend: function(){
          HoldOn.open({message:"Carregando dados, aguarde...",theme:'sk-bounce'});
        },
        success: function(ret){
          
          if(ret.success){
            var data = ret.data[0];
            self.toView = data.id;
            $('.btn-info-edit').css({'display':'inline'}).find('.badge').text(data.id);
            
            self.callbacks.view.onSuccess(data);

            //when editing, need to repeat this peace of code 
            if(self.wz.keys.numtabs==1){
              $(".btn-next").addClass('btn-success').addClass("btn-success");
              $(".btn-next .ico").removeClass('ico-arrow-right').addClass("ico-save");
            }
            
            setTimeout(function(){
              self.tabs['cadastrar'].tab.tab('show');
              HoldOn.close();
              //focus on first enabled element, to fix placeholder glitch
              self.df.find("input:enabled,input:enabled").first().focus();
            },500);
          }
        },
        error: function(ret){
          self.defaults.ajax.onError(ret,self.callbacks.view.onError);
          HoldOn.close();
        }
      });
    }

    //update
    this.update = function(id){
      self = this;
      $.ajax({
        method: 'POST',
        url:self.path+"/update/"+id,
        cache:false,
        dataType: "json",
        data: self.df.serializeArray(),
        beforeSend: function(){
          HoldOn.open({message:"Atualizando dados, aguarde...",theme:'sk-bounce'});
        },
        success: function(ret){
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
              onClose:function(){
                self.unload(self);
              }
            });
          }
        },      
        error: function(ret){
          self.defaults.ajax.onError(ret,self.callbacks.update.onError);
        }
      });
    }

    //update
    this.delete = function(id)
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
        preConfirm: function(){
          return new Promise(function (resolve) {
            $.get(self.path+"/delete/"+id)
              .done(function (ret){
                
                if(ret.sts == true)
                {
                  swal.insertQueueStep({
                    title:"Registro excluído!",
                    html:"O registro <b>"+(id)+"</b> foi excluído do sistema!",
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
              .fail(function(ret) {
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
    this.unload = function(self){
      //verifica se a aba é a última
      //if(self.wz.wizard('selectedItem') == self.wz.keys.numtabs){
        $(".btn-next").removeClass('btn-success').addClass('btn-primary').get();
        $(".btn-next .ico").removeClass('ico-save').addClass("ico-arrow-right");
        $(".btn-next").get()[0].firstChild.nodeValue = $(".btn-next").attr('data-next');
      // }
      self.toView = null;
      self.df[0].reset();
      $('.btn-info-edit').css({'display':'none'}).find('.badge').text('');
      
      self.fv.forEach(function f(element, index, array) {
        self.fv[index].resetForm(true);
      });

      self.callbacks.unload(self);
      self.wz.wizard('selectedItem',{step:1});
      self.df.find("input:enabled").first().focus();
    }

    
    
    
    
    
    
    
    //Default CRUD ajax request onerror
    this.defaults.ajax = {
      onError: function(ret,callback){
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





    if(self.cem.length > 0){
      self.cdt = $('#categories-table').DataTable({
        aaSorting:[[0,"desc"]],
        searching: false,
        ajax: '/categories/serviceChildCats/'+serviceMainCat.id,
        initComplete:function(data){
          
        },
        footerCallback:function(row, data, start, end, display){
        },
        columns: [
          { data: 'id', name: 'id'},
          { data: 'category', name: 'category'},
          { data: 'category_id', name: 'category_id'},
          { data: 'description', name: 'description'},
          { data: 'actions', name: 'actions'},
        ],
        columnDefs:
        [
          {targets:'__dt_',width:"5%",className:"text-center"},
          {targets:'__dt_categoria',width:"20%"},
          {targets:'__dt_categoria-pai',width:"10%",className:"text-center"},
          {
            targets:'__dt_acoes',width:"8%",className:"text-center",searchable:false,orderable:false,render:function(data,type,row,y){
              return self.cdt.addDTButtons({
                buttons:[
                  {ico:'ico-edit',_class:'text-info',title:'editar'},
                  {ico:'ico-trash',_class:'text-danger',title:'excluir'},
              ]});
            }
          },
        ]	
      }).on('xhr.dt', function (e, settings, json, xhr) {
        self.cem.find('select#category_id').empty();

        self.cem.find('select#category_id').append( 
          "<option value='"+serviceMainCat.id+"'>Nenhuma</option>"
        ); 
        
        json.data.forEach(function f(item, index) {
          self.cem.find('select#category_id').append(
            "<option value='"+item.id+"'>#"+item.id+" - "+item.category+"</option>"
          );
        })
  
      }).on('click',".btn-dt-button[data-original-title=editar]",function(){
        var data = self.cdt.row($(this).parents('tr')).data();
  
        self.cem.find('input#edit').val(data.id);
        self.cem.find('input#category').val(data.category);
        self.cem.find('textarea#description').val(data.description);
        self.cem.find('select#category_id').val(data.category_id);
         
        self.cem.modal('show'); 
      }).on('click','.ico-trash',function(){
        var data = self.cdt.row($(this).parents('tr')).data();
        self.deleteCategory(data.id);
      }); 
  
      $('button#new-category').on('click',function(){
        self.cem.find('input#edit').val(-1);
        self.cem.find('input#category').val("");
        self.cem.find('textarea#description').val("");
        self.cem.find('select#category_id').val(serviceMainCat.id);
  
        self.cem.modal('show');
      });
  
      $('button#save-category').on('click',function(){
        var formData = $('#category-form').serializeArray();  
        
        if(self.cem.find('input#edit').val() == '-1')
          self.createCategory(formData);
        else  
          self.updateCategory(formData);
      });
    }
    

    this.createCategory = function createCategory(formData){
      $.ajax({ 
        url: '/categories/create',
        method: 'POST',
        data: formData,
        beforeSend: function(){
          HoldOn.open({message:"Salvando dados, aguarde...",theme:'sk-bounce'});
        },
        success: function(data){
          if(data.success)
          {
            self.tabs['categorias'].setState(true);
            self.tabs['categorias'].tab.tab('show');
            self.cem.modal('hide'); 
            HoldOn.close();
            swal({
              title:"Cadastro efetuado com sucesso!",
              confirmButtonText:'OK',
              type:"success",
              onClose:function(){
                // self.cdt.ajax.reload();
                // self.cdt.draw(true);
                location.reload();
              }
            });
          }
        },
        error:function(ret){
          self.defaults.ajax.onError(ret,self.callbacks.create.onError);
        }
      });//end ajax
    }
    
    this.updateCategory = function updateCategory(formData){
      $.ajax({ 
        url: '/categories/update',
        method: 'POST',
        data: formData,
        beforeSend: function(){
          HoldOn.open({message:"Atualizando dados, aguarde...",theme:'sk-bounce'});
        },
        success: function(data){
          if(data.success)
          {
            self.tabs['categorias'].setState(true);
            self.tabs['categorias'].tab.tab('show');
            self.cem.modal('hide'); 
            HoldOn.close();
            swal({
              title:"O registro foi atualizado com sucesso!",
              confirmButtonText:'OK',
              type:"success",
              onClose:function(){
                // self.cdt.ajax.reload();
                // self.cdt.draw(true);
                location.reload();
              }
            });
          }
        },
        error:function(ret){
          self.defaults.ajax.onError(ret,self.callbacks.create.onError);
        }
      });//end ajax
    }
    
    this.deleteCategory = function deleteCategory(id){
      swal.queue([{
        title:"Excluir Registro?",
        html:"Ao executar esta ação <b>todas as informações vinculadas a este registro serão perdidas</b>, confirma a exclusão?",
        type:"question",
        confirmButtonText:"<i class = 'ico ico-thumbs-up'></i> Sim, confirmo",
        cancelButtonText:"<i class = 'ico ico-thumbs-down'></i> Não, cancelar",
        showCancelButton: true,
        reverseButtons:true,
        showLoaderOnConfirm: true,
        preConfirm: function(){
          return new Promise(function (resolve) {
            $.get("/categories/delete/"+id)
              .done(function (ret){
                
                if(ret.sts == true)
                {
                  swal.insertQueueStep({
                    title:"Registro excluído!",
                    html:"O registro <b>"+(id)+"</b> foi excluído do sistema!",
                    type:"success"
                  })
                }
                else
                  swal.insertQueueStep({
                      title:"Ocorreram problemas, o registro não pode ser removido!",
                      type:"error",
                      
                  });
                  
                // self.cdt.ajax.reload();
                // self.cdt.draw(true);
                resolve();
              })
              .fail(function(ret) {
                if(ret.status == 403){
                  var data = JSON.parse(ret.responseText);
                  for(var err in data.errors){
                    toastr["error"](data.errors[err]);
                  }
                }
                resolve();
              })
          }).then(function(value) {
            setTimeout(function(){ 
              location.reload();
            }, 2000);
          })
        }
      }]);
    }



    
  }
}//end DVService

