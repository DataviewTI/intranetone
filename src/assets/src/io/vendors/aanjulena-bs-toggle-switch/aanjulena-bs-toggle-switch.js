$.fn.aaToggle = function(state) {
  return this.each(function() {
    if (state + "" !== $(this).attr("aria-pressed")) $(this).button("toggle");
  });
};

$.fn.aaDefaultState = function() {
  return this.each(function() {
    if ($(this).attr("data-default-state") !== $(this).attr("aria-pressed"))
      $(this).button("toggle");
  });
};
