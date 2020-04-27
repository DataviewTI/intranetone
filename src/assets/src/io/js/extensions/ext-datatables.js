/*
|--------------------------------------------------------------------------
| Extensions for Datatables IntranetOne
|--------------------------------------------------------------------------
*/
//ações padrão para botões
//Extensão da jquery para ordenação de datas, require momentjs
$.extend(jQuery.fn.dataTableExt.oSort, {
  "date-br-pre": function(a) {
    if (a == null || a == "") return 0;
    return moment(a, "DD/MM/YYYY").format("x");
  },
  "date-br-asc": function(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  },
  "date-br-desc": function(a, b) {
    return a < b ? 1 : a > b ? -1 : 0;
  },
});

//Extensão datatables para default-init
$.fn.dataTable.Api.register("addDTSelectFilter()", function(arr) {
  let api = this;
  arr.forEach(function(obj) {
    obj.el.on("change", function() {
      let val = $(this).val() == null ? "" : $(this).val();

      console.log(api.column(`${obj.column}:name`));

      if (obj.format !== undefined && val != "")
        val = obj.format.replace("{{value}}", $(this).val());
      api
        .column(`${obj.column}:name`)
        .search(val)
        .draw();
    });
  });
});

$.fn.dataTable.Api.register("addDTInputFilter()", function(arr) {
  let api = this;
  arr.forEach(function(obj) {
    obj.el.on("keyup", function() {
      let val = $(this).val();
      api
        .column(`${obj.column}:name`)
        .search(`${val}`)
        .draw();
    });
  });
});

//Extensão datatables para default-init
$.fn.dataTable.Api.register("addDTButtons()", function(param) {
  let ret = [];
  ret.push(
    `<div class = '${param.class ||
      ""} d-flex justify-content-center container-dtbutton'>`
  );
  param.buttons.forEach(function(obj) {
    let title = "";
    if (obj.title !== undefined)
      title = `data-toggle='tooltip' data-html='${obj.html ||
        false}' data-placement='${obj.pos || "top"}' title="${obj.title}"`;
    ret.push(
      `<span ${title || ""} class='d-flex my-auto btn-dt-button ${obj._class ||
        "btn-primary"}'><i class = 'm-auto ico ${obj.ico ||
        ""}'><span class = 'd-none'>${obj.value || ""}</span></i></span>`
    );
  });
  ret.push("</div>");
  return ret.join("");
});

//Extensão datatables para default-init
$.fn.dataTable.Api.register("addDTIcon()", function(obj) {
  let title = "";
  if (obj.title !== undefined)
    title = `data-toggle='tooltip' data-html='${obj.html ||
      false}' data-placement='${obj.pos || "top"}' title="${obj.title}"`;

  return `<i ${title ||
    ""} class='btn-dt-icon ${obj._class || ""} ico ${obj.ico || ""}'><span class = 'd-none'>${obj.value || ""}</span></i>`;
});

$.fn.dataTable.Api.register("addDTBetweenDatesFilter()", function(obj) {
  let index = this.column(obj.column + ":name").index();
  $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
    let dti = obj.min.pickadate("picker").get("select");
    let dtf = obj.max.pickadate("picker").get("select");
    let min = dti != null ? dti.pick : NaN;
    let max = dtf != null ? dtf.pick : NaN;
    let age = moment(data[index], "DD/MM/YYYY").format("x");

    $.fn.dataTable.ext.search.pop();

    if (
      (isNaN(min) && isNaN(max)) ||
      (isNaN(min) && age <= max) ||
      (min <= age && isNaN(max)) ||
      (min <= age && age <= max)
    )
      return true;
    return false;
  });
});

$.fn.dataTable.Api.register("addDTCustomFilter()", function(obj) {
  obj.el.bind("change", () => {
    let index = this.column(obj.column + ":name").index();
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
      // $.fn.dataTable.ext.search.pop();
      return obj.callback(JSON.parse(data[index]), obj.el.val());
    });
    this.draw();

    // this.column(obj.column + ":name")
    //   .data()
    //   .filter(function(value, index) {
    //     console.log("HA ", value, index);
    //     return obj.callback(value, obj.el.val());
    //   })
    //   .draw();
  });
});
