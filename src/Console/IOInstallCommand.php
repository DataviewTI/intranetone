<?php
namespace Dataview\IntranetOne\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Dataview\IntranetOne\IntranetOneServiceProvider;
use Cartalyst\Sentinel\Laravel\SentinelServiceProvider;
use Illuminate\Support\Facades\Schema;
use Dataview\IntranetOne\IntranetOne;
use Dataview\IntranetOne\DatabaseSeeder;

class IOInstallCommand extends Command
{
    protected $name = 'intranetone:install';
    protected $description = 'Instalação do pacote Dataview/IntranetOne';
    public function handle()
    {
        IntranetOne::installMessages($this);

        $this->info('Publicando os arquivos de configuração...');
        
        Artisan::call('vendor:publish', [
            '--provider' => IntranetOneServiceProvider::class,
        ]);

        IntranetOne::installMessages($this);

        $this->info('Publicando providers de terceiros...');
        Artisan::call('vendor:publish', [
            '--provider' => SentinelServiceProvider::class,
        ]);

        $audits_exists = false;
        $migrations_to_remove = [];
        $base_migrations = scandir(database_path('migrations'));
        foreach($base_migrations as $f){

          if(strpos($f,'users_table')!==false)
            array_push($migrations_to_remove,$f);
  
          if(strpos($f,'password_resets_table')!==false)
            array_push($migrations_to_remove,$f);

          if(strpos($f,'create_audits_table')!==false)
            $audits_exists = true;
        }

        if(!$audits_exists)
          Artisan::call('audit:install');

        IntranetOne::installMessages($this);
        if(count($migrations_to_remove))
          $this->info('Apagando arquivos de migração desnecessários...');
          foreach($migrations_to_remove as $f){
            unlink(database_path('migrations/'.$f));
        }


        $this->info('Criando link simbólico...');
        Artisan::call('storage:link');

        IntranetOne::installMessages($this,2);

        //só executa migração se as tabelas ainda não existirem
        if(!Schema::hasTable('activations')){//uma delas
          $this->info('Executando migrações de terceiros...');
          Artisan::call('migrate', [
            '--path' => 'database/migrations',
          ]);
        }

        if(!Schema::hasTable('services')){//uma delas
          $this->info('Executando migrações da intranetone...');
          Artisan::call('migrate', [
            '--path' => 'vendor/dataview/intranetone/src/database/migrations',
          ]);
        }
        
        
        IntranetOne::installMessages($this,1);

        $this->info('seeding database...');
        Artisan::call('db:seed', [
          '--class' => DatabaseSeeder::class,
        ]);
        
        //$this->info('Atualizando config');
        //Artisan::call('config:cache');

        $this->info(' ');
        $this->info('IntranetOne Instalada com sucesso! _|_');
    }
}
