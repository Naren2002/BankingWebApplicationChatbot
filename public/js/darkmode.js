light = 1;

function darkMode() {
  $("#darkBtn").on("click", function(){

    if ($("nav").hasClass("navBarLight")) {
      if($(".body").hasClass("bodyLight")){
        $(".body").removeClass("bodyLight");
        $(".body").addClass("bodyDark");
      }
      if($(".form-control").hasClass("form-control")){
        $(".form-control").addClass("form-control-dark");
      }
      $("nav").removeClass("navBarLight");
      $("nav").addClass("navBarDark");
      if($("a").hasClass("nav-link")){
        $("a").removeClass("navLinkLight");
        $("a").addClass("navLinkDark");
      }
      if($("span").hasClass("logoshiz")){
        $("span").removeClass("logoshizLight");
        $("span").addClass("logoshizDark");
      }
      if($("#darkBtn").hasClass("btn-dark")){
        $("#darkBtn").removeClass("btn-dark");
        $("#darkBtn").addClass("btn-light");
        $("#darkBtn").text("Light mode");
      }
      if($("table").hasClass("table-light")){
        $("table").removeClass("table-light");
        $("table").addClass("table-dark");
      }
      if($(".inputAccInfoText").hasClass("inputAccInfoTextLight")){
        $(".inputAccInfoText").removeClass("inputAccInfoTextLight");
        $(".inputAccInfoText").addClass("inputAccInfoTextDark");
      }
    } else {
      $("nav").removeClass("navBarDark");
      $("nav").addClass("navBarLight");
      if($(".body").hasClass("bodyDark")){
        $(".body").removeClass("bodyDark");
        $(".body").addClass("bodyLight");
      }
      if($("a").hasClass("nav-link")){
        $("a").removeClass("navLinkDark");
        $("a").addClass("navLinkLight");
      }
      if($(".form-control").hasClass("form-control-dark")){
        $(".form-control").removeClass("form-control-dark");
      }
      if($("span").hasClass("logoshiz")){
        $("span").removeClass("logoshizDark");
        $("span").addClass("logoshizLight");
      }
      if($("#darkBtn").hasClass("btn-light")){
        $("#darkBtn").removeClass("btn-light");
        $("#darkBtn").addClass("btn-dark");
        $("#darkBtn").text("Dark mode");
      }
      if($("table").hasClass("table-dark")){
        $("table").removeClass("table-dark");
        $("table").addClass("table-light");
      }
      if($(".inputAccInfoText").hasClass("inputAccInfoTextDark")){
        $(".inputAccInfoText").removeClass("inputAccInfoTextDark");
        $(".inputAccInfoText").addClass("inputAccInfoTextLight");
      }
    }
  });
}
