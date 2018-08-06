    $.fn.setDisabled = function(state){
      if(state)
        this.append("<div class = 'el-disabled'></div>")
      else
        this.find(".el-disabled").first().remove();
      return this;
    };