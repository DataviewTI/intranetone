//Extensão datatables para default-init
$.extend(true, $.fn.dataTable.defaults, {
  processing: true,
  serverSide: false,
  lengthChange: false,
  pageLength: 8,
  language: { url: "/io/vendors/datatables/lang/datatables-pt-br.json" },
  initComplete: function(_this) {
    $("#ft_search").on("keyup search input paste cut", function() {
      _this.fnFilter(this.value); //search(this.value).draw();
    });
  },
});
