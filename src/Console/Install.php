<?php
namespace Dataview\IntranetOne\Console;

ini_set('max_execution_time', 900);

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Dataview\IntranetOne\IntranetOneServiceProvider;
use Cartalyst\Sentinel\Laravel\SentinelServiceProvider;
use Illuminate\Support\Facades\Schema;
use Dataview\IntranetOne\IntranetOne;
use Dataview\IntranetOne\DatabaseSeeder;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class Install extends Command
{
    protected $name = 'intranetone:install';
    protected $description = 'Instalação do pacote Dataview/IntranetOne';
    public function handle()
    {
        IntranetOne::installMessages($this);

        $this->line('Publicando os arquivos de configuração...');
        
        Artisan::call('vendor:publish', [
            '--provider' => IntranetOneServiceProvider::class,
        ]);

        IntranetOne::installMessages($this);

        $this->line('Publicando providers de terceiros...');
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

        IntranetOne::installMessages($this);


        IntranetOne::installMessages($this);
        if(count($migrations_to_remove))
          $this->line('Apagando arquivos de migração desnecessários...');
          foreach($migrations_to_remove as $f){
            unlink(database_path('migrations/'.$f));
        }

        if(!$audits_exists)
          Artisan::call('auditing:install');

        $this->line('Criando link simbólico...');
        Artisan::call('storage:link');

        IntranetOne::installMessages($this,2);

        //só executa migração se as tabelas ainda não existirem
        if(!Schema::hasTable('activations')){//uma delas
          $this->line('Executando migrações de terceiros...');
          Artisan::call('migrate', [
            '--path' => 'database/migrations',
          ]);
        }

        if(!Schema::hasTable('services')){//uma delas
          $this->line('Executando migrações da intranetone...');
          Artisan::call('migrate', [
            '--path' => 'vendor/dataview/intranetone/src/database/migrations',
          ]);
        }
        
        
        IntranetOne::installMessages($this,1);

        $this->line('seeding database...');
        Artisan::call('db:seed', [
          '--class' => DatabaseSeeder::class,
        ]);
        
        // Processo de instalação individual de pacotes via PNPM via package.json->IODependencies
        $pkg = json_decode(file_get_contents(IntranetOneServiceProvider::pkgAddr('/assets/package.json')),true);

        //$this->line("Preparando instalação com PNPM");
        //(new Process('npm install -g pnpm'))->run();
        
        (new Process('npm set progress=false'))->run();
        $this->comment('Instalando npm package '.$pkg['name'].'@'.$pkg['version']);

        try{
          (new Process('npm install vendor/dataview/'.$pkg['name'].'/src/assets/'))->setTimeout(3600)->mustRun();
        }
        catch(ProcessFailedException $exception){
          $this->error($exception->getMessage());
        }

        //(new Process('npm set preserve-symlinks=true'))->run();
        $this->line('Instalando dependencias...');

        $bar = $this->output->createProgressBar(count($pkg['IODependencies'])+1);
        foreach($pkg['IODependencies'] as $key => $value){
          try{
            $bar->advance();
            $this->comment(" instalando ".$key.'@'.$pkg['IODependencies'][$key]);
            (new Process('npm install '.$key.'@'.$pkg['IODependencies'][$key]))->setTimeout(3600)->mustRun();
          }catch (ProcessFailedException $exception){
            $this->error($exception->getMessage());
          }
          catch (RuntimeException $exception){
            $this->error($exception->getMessage());
            $this->error("colocar em fila e tentar novamente");
          }catch (Exception $exception){
            $this->error("exceção geral");
            $this->error($exception->getMessage());
          }
        }
        (new Process('npm set progress=true'))->run();
        $bar->finish();
        /** fim do processo de instalação de pacotes */

        $this->info(' IntranetOne Instalada com sucesso! _|_');
    }
}
