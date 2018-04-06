<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId            : '{{$app_id}}',
      autoLogAppEvents : true,
      xfbml            : true,
      version          : '{{$app_version}}'
    });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/{{$app_locale}}/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
</script>