<?php

namespace Dataview\IntranetOne;

use Illuminate\Support\ServiceProvider;

use Dataview\IntranetOne\Console\IOInstallCommand;

class IntranetOneServiceProvider extends ServiceProvider
{
    public function boot()
    {
      $this->publishes([
        __DIR__.'/config/intranetone.php' => config_path('intranetone.php'),
        // __DIR__.'/Http/Middleware/SentinelAdmin.php' => app_path('Http/Middleware/SentinelAdmin.php')
      ]);
      
      $this->publishes([
        __DIR__.'/root' => base_path('/')
      ],'root');

      $this->loadViewsFrom(__DIR__.'/views', 'IntranetOne');
      //$this->loadMigrationsFrom(__DIR__.'/database/migrations');
      
      //$this->mergeConfigFrom(__DIR__.'/config/filesystems.php', 'filesystems.disks');
    }

    public function register()
    {
      /*$this->app->bind('dataview-intranetone', function() {
        return new IntranetOne;
      });*/
      $this->commands([
        IOInstallCommand::class,
      ]);

      //define um namespace para cada rota carregada através do package
      $this->app['router']->group(['namespace' => 'dataview\intranetone'], function () {
        include __DIR__.'/routes/web.php';
      });

      //adiciona as middlewares HttpsProtocol e SentinelAdmin ao Kernel
      $kernel = $this->app->make('Illuminate\Contracts\Http\Kernel');
      $kernel->pushMiddleware('\Dataview\IntranetOne\Http\Middleware\HttpsProtocol');
      $this->app['router']->aliasMiddleware('admin', '\Dataview\IntranetOne\Http\Middleware\SentinelAdmin');
      
      $this->app->make('Dataview\IntranetOne\AuthController');
      $this->app->make('Dataview\IntranetOne\DropZoneController');
      $this->app->make('Dataview\IntranetOne\GroupController');
      $this->app->make('Dataview\IntranetOne\CategoryController');
      $this->app->make('Dataview\IntranetOne\IOController');
    }
}
