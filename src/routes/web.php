<?php
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    ██████╗      █████╗     ███████╗    ███████╗
    ██╔══██╗    ██╔══██╗    ██╔════╝    ██╔════╝
    ██████╔╝    ███████║    ███████╗    █████╗  
    ██╔══██╗    ██╔══██║    ╚════██║    ██╔══╝  
    ██████╔╝    ██║  ██║    ███████║    ███████╗
    ╚═════╝     ╚═╝  ╚═╝    ╚══════╝    ╚══════╝
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
function __getIORoute($m){
  return "dataview\intranetone\AuthController@".$m;
}
/*Route::pattern('slug', '[a-z0-9- _]+');

Route::group(array('prefix' => 'dropzone'), function () {
	Route::get('preview-template/{template}', 'DropZoneController@getPreviewTemplate');
	Route::get('infos-modal/{template}', 'DropZoneController@getModal');
	Route::post('upload', 'DropZoneController@upload');
});*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ....................................................................................
    ██╗     ██████╗              █████╗     ██████╗     ███╗   ███╗    ██╗    ███╗   ██╗
    ██║    ██╔═══██╗            ██╔══██╗    ██╔══██╗    ████╗ ████║    ██║    ████╗  ██║
    ██║    ██║   ██║            ███████║    ██║  ██║    ██╔████╔██║    ██║    ██╔██╗ ██║
    ██║    ██║   ██║            ██╔══██║    ██║  ██║    ██║╚██╔╝██║    ██║    ██║╚██╗██║
    ██║    ╚██████╔╝            ██║  ██║    ██████╔╝    ██║ ╚═╝ ██║    ██║    ██║ ╚████║
    ╚═╝     ╚═════╝             ╚═╝  ╚═╝    ╚═════╝     ╚═╝     ╚═╝    ╚═╝    ╚═╝  ╚═══╝
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* LOGIN ROUTES */

Route::group(array('prefix' => 'admin'),function(){

//  Route::get('/', array('as' => 'signin', 'uses' => __getIORoute('teste')));
 
  Route::get('signin',['as' => 'signin', 'uses' => __getIORoute('getSignin')]);
  //Route::post('signin', __getIORoute('postSignin'));

/*
  Route::get('forgot-password/{userId}/{passwordResetCode}', array('as' => 'forgot-password-confirm', 'uses' => 'AuthController@getForgotPasswordConfirm'));
  Route::post('forgot-password/{userId}/{passwordResetCode}', 'AuthController@postForgotPasswordConfirm');

  Route::get('logout', array('as' => 'logout', 'uses' => 'AuthController@getLogout'));
});

  */
});

Route::group(['prefix' => 'admin', 'middleware' => 'admin', 'as' => 'admin.'],function(){
  
//  Route::get('/', ['as' => 'signin', 'uses' => __getIORoute('teste')]);

  /*Route::get('/', ['as' => 'dashboard','uses' => function(){
    return "XXX";
    //redirect('/teste');
  }]);*/
});


//Route::get('timezones/{timezone}','dataview\intranetone\IntranetOneController@index');