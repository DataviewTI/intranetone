    //Extensão para Pillbox, separar arquivos posteriormente
    $.fn.pillbox.Constructor.prototype.addColorItem = function(item={text:null,value:null},color='info',tip=false){
      color = color=='random' ?	color = ['danger','primary','success','info','warning'].random() : color;
      return this.$element.pillbox('addItems',{text:item.text,value:item.value,attr:{'tip':tip,'cssClass': 'btn-'+color}}).find('li').last().prev().removeClass('btn-default').addClass('btn-raised btn-lg');
    };