$.fn.setDisabled = function(state) {
  if (state) {
    if (!this.find("> .el-disabled").get().length)
      this.append("<div class = 'el-disabled'></div>");
    else return this;
  } else
    this.find(".el-disabled")
      .first()
      .remove();
  return this;
};

$.fn.attrchange = function(callback) {
  var MutationObserver =
    window.MutationObserver ||
    window.WebKitMutationObserver ||
    window.MozMutationObserver;

  if (MutationObserver) {
    var options = {
      subtree: false,
      attributes: true,
    };

    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(e) {
        callback.call(e.target, e.attributeName);
      });
    });

    return this.each(function() {
      observer.observe(this, options);
    });
  }
};
