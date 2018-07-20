<?php
/*
  funções declaradas dentro do web.php geram erro no artisan config:cache, mensagem de declaração duplicada
  sem existir, por isso foi usado o helper;
*/
use Dataview\IntranetOne;

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    ██████╗      █████╗     ███████╗    ███████╗
    ██╔══██╗    ██╔══██╗    ██╔════╝    ██╔════╝
    ██████╔╝    ███████║    ███████╗    █████╗  
    ██╔══██╗    ██╔══██║    ╚════██║    ██╔══╝  
    ██████╔╝    ██║  ██║    ███████║    ███████╗
    ╚═════╝     ╚═╝  ╚═╝    ╚══════╝    ╚══════╝
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/*Route::pattern('slug', '[a-z0-9- _]+');
*/

Route::group(array('prefix' => 'dropzone'), function () {
	Route::get('preview-template/{template}', 'DropZoneController@getPreviewTemplate');
	Route::get('crop-modal/{template}', 'DropZoneController@getCropModal');
	Route::get('infos-modal/{template}', 'DropZoneController@getModal');
	Route::post('upload', 'DropZoneController@upload');
});

# Group Management
Route::group(array('prefix' => 'group'), function () {
	Route::get('file/{imgId}/{size?}','GroupController@getFile');
});		

# Category publics, while a service is created...
Route::group(array('prefix' => 'categories'), function () {
  Route::get('list/{id?}/{type?}', 'CategoryController@list');//new approach
  Route::get('serviceChildCats/{service}', 'CategoryController@dtServiceChildCategories');//new approach
  Route::post('create/', 'CategoryController@create');//new approach
  Route::post('update/', 'CategoryController@update');//new approach
  Route::get('delete/{id}', 'CategoryController@delete');//new approach
//  Route::get('categories', 'CategoryController@getCategories');
//  Route::get('subcategories/{catId}', 'CategoryController@getSubCategories');
//  Route::get('types', 'CategoryController@getTypes');
//  Route::get('categoriesByType/{typeId}', 'CategoryController@getCategoriesByType');
});		



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

Route::group(['prefix' => 'admin','middleware' => ['web']],function(){
  Route::get('signin',['as' => 'signin', 'uses' => 'AuthController@getSignin']);
  Route::post('signin', 'AuthController@postSignin');
  Route::get('logout', ['as' => 'logout', 'uses' => 'AuthController@getLogout']);

  Route::get('password/request', 'AuthController@showPasswordRequestForm')->name('password.request');
  Route::post('password/email', 'AuthController@sendPasswordResetEmail')->name('password.email');
  Route::get('password/edit/{userId}/{token}', function($userId, $token){
    return view('IntranetOne::io.auth.password.edit', ['userId' => $userId, 'token' => $token]);
  })->name('password.edit');
  Route::post('password/reset', 'AuthController@passwordReset')->name('password.reset');

});
//Após Login, dentro do dashboard todos passam pelo midlware admin 
Route::group(['prefix' => 'admin', 'middleware' => ['web','admin'], 'as' => 'admin.'],function(){
  
  /* se acessar /admin apenas e estiver logado, redireciona para o dash
     se não estiver logado, o middleware retorna para signin
  */
  Route::get('/', ['as' => 'dashboard','uses' => function(){
    return redirect('admin/dash');
  }]);

  //Route::get('teste',['as' => 'teste', 'uses' => IntranetOneHelper::getIORoute('teste')]);

  Route::get('dashy', ['as' => 'dashy','uses' => function(){
    return "asaSS";
  }]);

  //default on admin logged = route to dash
  Route::group(['prefix' => 'dash'], function () {
    Route::get('/',function(){
      return view('IntranetOne::io.services.dash.index');
    });
  });

}); //end midlware admin
