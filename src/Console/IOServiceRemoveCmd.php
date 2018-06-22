<?php
namespace Dataview\IntranetOne\Console;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Dataview\IntranetOne\IntranetOne;
use Dataview\IntranetOne\Service;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class IOServiceRemoveCmd extends Command
{
  protected $signature = "";
  protected $description = "";

  public function __construct($param){
    $this->param = (object) $param;
    $this->signature = 'io-'.(str_slug($this->param->service)).':remove {--force}';
    $this->description = 'Desinstalação do serviço para IntranetOne - ';
    parent::__construct();
  }
  public function handle()
  {
    $s = str_slug($this->param->service);
    if(!$this->option('force'))
      $exec = $this->confirm('Tem certeza que deseja remover o serviço? [y|N]');
    else
      $exec = $this->option('force'); 

    if($exec){
      if(Schema::hasTable(str_plural($s))){
        foreach($this->param->tables as $t){
          $this->line('Removendo tabela '.$t);
          Schema::dropIfExists($t);
        }
      }
  
      IntranetOne::installMessages($this);
      $this->line('Removendo migrações...');
      Service::where('alias',$s)->forceDelete();
      \DB::table('migrations')
        ->where('migration','like','%'.$s.'%')
        ->orWhere('migration','like','%'.str_plural($s).'%')
        ->delete();

        IntranetOne::installMessages($this,1);
        $this->line('Removendo assets...');
        (new Process('npm set progress=false'))->run();
        (new Process('npm install -g pnpm'))->run();
        (new Process('pnpm remove intranetone-'.$s))->setTimeout(36000)->run();
        (new Process('npm set progress=true'))->run();
        
        $this->info(' ');
        $this->info('IntranetOne - '.title_case($s).' removido com sucesso! :(');
    }
    else
      $this->info('Remoção cancelada...');
  }
}
