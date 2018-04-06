<?php

namespace Dataview\IntranetOne;

use Illuminate\Support\ServiceProvider;

class IntranetOneServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        $this->publishes([
        __DIR__.'/config/intranetone.php' => config_path('intranetone.php'),
      ]);
      
      $this->publishes([
        __DIR__.'/path/to/assets' => public_path('vendor/courier'),
      ], 'public');
      
      $this->loadViewsFrom(__DIR__.'/views', 'IntranetOne');

      //$this->loadMigrationsFrom(__DIR__.'/database/migrations');
      
      //$this->mergeConfigFrom(__DIR__.'/config/app.php', 'intranetone');
    }

    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
      //$this->mergeConfigFrom(__DIR__.'/config/app.php', 'intranetone');
      include __DIR__.'/routes/web.php';
      $this->app->make('Dataview\IntranetOne\IntranetOneController');
      $this->app->make('Dataview\IntranetOne\AuthController');
    }
}
