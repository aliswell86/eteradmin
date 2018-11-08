var myajax = {};

myajax.creaAjax = function() {
  var xhr = null;
  xhr = new XMLHttpRequest();
  return xhr;
};

myajax.ajaxSubmit = function(url,data,callback) {
  var xhr = myajax.creaAjax();

  var options = {
    contentType : "application/x-www-form-urlencoded; charset=UTF-8",
    url : url,
    data : data,
    type : "POST",
    // dataType : "JSON",
    beforeSend: function () {
      var width = 0;
      var height = 0;
      var left = 0;
      var top = 0;
      width = 50;
      height = 50;

      top = ( $(window).height() - height ) / 2 + $(window).scrollTop();
      left = ( $(window).width() - width ) / 2 + $(window).scrollLeft();

      if($("#div_ajax_load_image").length != '0') {
        $("#div_ajax_load_image").css({
          "top": top+"px",
          "left": left+"px"
        });
        $("#div_ajax_load_image").show();
      }
      else {
        $('body').append('<div id="div_ajax_load_image" style="position:absolute; top:' + top + 'px; left:' + left + 'px; width:' + width + 'px; height:' + height + 'px; z-index:9999; background:#f0f0f0; filter:alpha(opacity=50); opacity:alpha*0.5; margin:auto; padding:0; "><img src="/resource/img/loading.gif" style="width:50px; height:50px;"></div>');
      }
    },
    complete: function () {
      $("#div_ajax_load_image").hide();
    },
    error : function(xhr, textStatus) {
      console.log("xhr.status : " + xhr.status + "\n" + "textStatus : " + textStatus);
    },
    success : function(data, textStatus, xhr) {
      $("#div_ajax_load_image").hide();
      callback(data, textStatus, xhr);
    }
  };
  $.ajax(options);
};

myajax.ajaxStatus = function(xhr, textStatus) {
  if(textStatus != "success") {
    alert("[SERVER ERROR]["+xhr.status+"]["+textStatus+"]");
    return false;
  }else{
    return true;
  }
};
