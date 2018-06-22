try{
  swal.setDefaults({
  buttonsStyling:false,
  confirmButtonClass:"btn btn-lg btn-primary mx-2",
  cancelButtonClass:"btn btn-lg btn-warning mx-2",
  buttonsStyling:false,
  confirmButtonText: "<span class = 'ico ico-thumbs-up'></span> Sim",
  cancelButtonText: "<span class = 'ico ico-thumbs-down'></span> Não",
  showCancelButton: false,
  reverseButtons:false,
  allowOutsideClick:false,
  });
}
catch(err){
  console.log(err);
	console.warn('dataview helper inicialização - não carregado | sweetalert2')
}