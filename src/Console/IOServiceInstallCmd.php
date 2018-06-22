<?php
namespace Dataview\IntranetOne\Console;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Dataview\IntranetOne\IntranetOne;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class IOServiceInstallCmd extends Command
{
    protected $signature = "";
    protected $description = "";

    public function __construct($param){
      $this->param = (object) $param;
      $this->signature = 'io-'.(str_slug($this->param->service)).':install';
      $this->description = 'Instalação do serviço para IntranetOne - '.$this->param->service;
      parent::__construct();
    }

    public function handle()
    {
      $s = str_slug($this->param->service);
      
      $this->line('Publicando arquivos...');
        
      IntranetOne::installMessages($this);

      Artisan::call('vendor:publish', [
          '--provider' => $this->param->provider
      ]);

      if(!Schema::hasTable(str_plural($s))){
        $this->line('Executando migrações '.$s.' service...');
        Artisan::call('migrate', [
          '--path' => 'vendor/dataview/io'.$s.'/src/database/migrations',
        ]);
      }
      
      IntranetOne::installMessages($this);

      $this->line('registrando serviço...');
      Artisan::call('db:seed', [
        '--class' => $this->param->seeder
      ]);
    
        /** Processo de instalação individual de pacotes via PNPM via package.json->IODependencies */
        $pkg = json_decode(file_get_contents($this->param->provider::pkgAddr('/assets/package.json')),true);

        $this->line("Preparando instalação com PNPM");
        (new Process('npm set progress=false'))->run();
        (new Process('npm install -g pnpm'))->run();

        $this->comment('Instalando npm package '.$pkg['name'].'@'.$pkg['version']);

        (new Process('npm install vendor/dataview/io'.$this->param->service.'/src/assets'))->setTimeout(36000)->run();

        $this->line('Instalando dependencias...');

        $bar = $this->output->createProgressBar(count($pkg['IODependencies'])+1);
        foreach($pkg['IODependencies'] as $key => $value){
          $bar->advance();
          $this->comment(" instalando ".$key.'@'.$pkg['IODependencies'][$key]);
          (new Process('pnpm install '.$key.'@'.$pkg['IODependencies'][$key]))->setTimeout(36000)->run();
        }
        (new Process('npm set progress=true'))->run();
        $bar->finish();
        /** fim do processo de instalação de pacotes */

        $this->info(' IntranetOne - '.$s.' Instalado com sucesso! _|_');
    }
}
