//Extensão datatables para default-init
$.extend(true, $.fn.dataTable.defaults, {
  processing: true,
  serverSide: false,
  lengthChange: false,
  pageLength: 8,
  language: { url: "/io/vendors/datatables/lang/datatables-pt-br.json" },
  initComplete: function(_this, search = $("#ft_search")) {
    if (search)
      search.on("keyup search input paste cut", (e) => {
        _this.fnFilter(e.currentTarget.value); //search(this.value).draw();
      });
  },
});
