<?php

namespace Dataview\IntranetOne;

use Illuminate\Support\ServiceProvider;

use Dataview\IntranetOne\Console\InstallCommand;

class IntranetOneServiceProvider extends ServiceProvider
{
    public function boot()
    {
      $this->publishes([
        __DIR__.'/config/intranetone.php' => config_path('intranetone.php'),
        __DIR__.'/Http/Middleware/SentinelAdmin.php' => app_path('Http/Middleware/SentinelAdmin.php')
      ]);
      /*$this->publishes([
        __DIR__.'/app' => app_path('/')
      ],'app');
      */

      $this->loadViewsFrom(__DIR__.'/views', 'IntranetOne');
      $this->loadMigrationsFrom(__DIR__.'/database/migrations');
      
      //$this->mergeConfigFrom(__DIR__.'/config/app.php', 'intranetone');
    }

    public function register()
    {
      /*$this->app->bind('dataview-intranetone', function() {
        return new IntranetOne;
      });*/
      $this->commands([
        InstallCommand::class,
      ]);

      //define um namespace para cada rota carregada através do package
      $this->app['router']->group(['namespace' => 'dataview\intranetone'], function () {
        include __DIR__.'/routes/web.php';
      });
      
      //$this->app->make('Dataview\IntranetOne\IntranetOneController');
      $this->app->make('Dataview\IntranetOne\AuthController');
      $this->app->make('Dataview\IntranetOne\DropZoneController');
    }
}
