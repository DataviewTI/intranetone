<?php

namespace Dataview\IntranetOne;

use Illuminate\Support\ServiceProvider;

use Dataview\IntranetOne\Console\InstallCommand;

class IntranetOneServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
       //Publish Files
       //
      $this->publishes([
        __DIR__.'/config/intranetone.php' => config_path('intranetone.php'),
        //__DIR__.'/app' => app_path('/'),

      ]);

      //or
        $this->publishes([
          __DIR__.'/app' => app_path('/')

        ],'app');
      
      $this->loadViewsFrom(__DIR__.'/views', 'IntranetOne');

      $this->loadMigrationsFrom(__DIR__.'/database/migrations');
      
      //$this->mergeConfigFrom(__DIR__.'/config/app.php', 'intranetone');
    }

    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
      /*$this->app->bind('dataview-intranetone', function() {
        return new IntranetOne;
      });*/
      $this->commands([
        InstallCommand::class,
      ]);
      
      $this->app['router']->group(['namespace' => 'dataview\intranetone'], function () {
        include __DIR__.'/routes/web.php';
      });
      
      //$this->app->make('Dataview\IntranetOne\IntranetOneController');
      $this->app->make('Dataview\IntranetOne\AuthController');
      $this->app->make('Dataview\IntranetOne\DropZoneController');
    }
}
