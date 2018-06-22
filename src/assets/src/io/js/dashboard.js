/*
|--------------------------------------------------------------------------
| Global JS configurations for default page
|--------------------------------------------------------------------------
*/

$ = jQuery;

/* ajax default params for all requests*/
$.ajaxSetup({
  dataType: "json",
  method:'GET',
  headers: {'X-CSRF-Token': laravel_token},
  async: true,
});

/* jQuery Closure MutationObserver to detect attribute changes*/
$(function() {
  (function($) {
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
  
      $.fn.attrchange = function(callback) {
          if (MutationObserver) {
              var options = {
                  subtree: false,
                  attributes: true
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
      }
  })(jQuery);
});

$(document).ready(function()
{
    $('#app-side-hoverable-toggler').on('click', function (){
      $('.app-side').toggleClass('is-hoverable');
      $(this).children('i.ico').toggleClass('ico-arrow-right ico-arrow-left');
    });

}); //FIM DO READY
