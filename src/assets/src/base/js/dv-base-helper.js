//inicializações padrão

function tabDeepLink(selector) {
  $(selector).each(function() {
    var $tabs = $(this);

    // match page load anchor
    var anchor = window.location.hash;
    if (anchor.length && $tabs.find('[href="' + anchor + '"]').length) {
      $tabs.foundation("selectTab", $(anchor));
      // roll up a little to show the header
      var offset = $tabs.offset();
      $(window).load(function() {
        $("html, body").animate({ scrollTop: 0 }, 0); //offset.top
      });
    }

    // append the hash on click
    $tabs.on("change.zf.tabs", function() {
      var anchor = $tabs.find(".tabs-title.is-active a").attr("href");
      history.pushState({}, "", anchor);
    });
  });
}

function dtBR2Any(dt, type, separator) {
  dt = dt.replace(/-|\/|\s|\./g, "*").split("*");
  var new_dt = null;
  switch (type) {
    case "EUA":
    case "USA":
      new_dt = [dt[2], dt[1], dt[0]].join(separator || "");
      break;
  }
  return new_dt;
}

function refreshSelect(obj, items) {
  //limpa os options atuais
  obj
    .find("option")
    .remove()
    .end();
  $.each(items, function(i, item) {
    obj.append(
      $("<option>", {
        value: item.value,
        text: item.text,
      })
    );
  });
}

function swapSave2Edit(obj, state) {
  if (state == "update") {
    obj.removeClass("btn-info");
    obj.addClass("btn-success");
    obj.html("<span class = 'fa fa-edit'></span> Atualizar");
  } else {
    obj.removeClass("btn-success");
    obj.addClass("btn-info");
    obj.html("<span class = 'fa fa-save'></span> Salvar");
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomString(length) {
  var alpha = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
  var arr = [];
  while (length--) arr.push(alpha.random());
  return arr.join("");
}

function getElement(html) {
  let template = document.createElement("template");
  template.innerHTML = html
    .replace(/\r\n|\n|\r|\s+/g, " ")
    .replace(/>\s</g, "><")
    .replace(/\"/g, '"')
    .trim();
  return template.content.firstChild;
}

/*
|--------------------------------------------------------------------------
| Array class prototypes
|--------------------------------------------------------------------------
*/
Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
};

/*
|--------------------------------------------------------------------------
| Date class prototypes
|--------------------------------------------------------------------------
*/
Date.prototype.diff = function(date) {
  return Math.ceil(
    Math.abs(date.getTime() - this.getTime()) / (1000 * 3600 * 24)
  );
};

/*
|--------------------------------------------------------------------------
| String class prototypes
|--------------------------------------------------------------------------
*/
String.prototype.slug = function(separator) {
  separator = separator | "-";
  var flip = separator == "-" ? "_" : "-";
  return this.toString()
    .toLowerCase()
    .replace(flip, separator)
    .replace(new RegExp("[^a-z0-9" + separator + "\\s]", "g"), "")
    .replace(new RegExp("[" + separator + "\\s]+", "g"), separator)
    .replace(
      new RegExp("^[" + separator + "\\s]+|[" + separator + "\\s]+$", "g"),
      ""
    );
};

/*
|--------------------------------------------------------------------------
| String class prototypes
|--------------------------------------------------------------------------
*/
