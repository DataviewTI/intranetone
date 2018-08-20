    $.fn.setDisabled = function(state){

      if(state){
        if(!this.find("> .el-disabled").get().length)
          this.append("<div class = 'el-disabled'></div>")
        else
        return this;
      }
      else
        this.find(".el-disabled").first().remove();
      return this;
    };