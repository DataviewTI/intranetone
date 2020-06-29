//toastr
try {
  toastr.options.preventDuplicates = true;
  toastr.options = {
    closeButton: true,
    debug: true,
    newestOnTop: false,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: true,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "300000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut",
  };
} catch (err) {
  console.warn("dataview helper inicialização - não carregado | toastr");
}
