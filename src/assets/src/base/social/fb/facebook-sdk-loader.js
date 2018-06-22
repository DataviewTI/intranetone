console.log({
  appId: window.FE.social_media.facebook.app_id,
  autoLogAppEvents : true,
  xfbml            : true,
  version          : window.FE.social_media.facebook.version,
});

FB.init({
  appId: window.FE.social_media.facebook.app_id,
  autoLogAppEvents : true,
  xfbml            : true,
  version          : window.FE.social_media.facebook.version,
});
FB.AppEvents.logPageView();
