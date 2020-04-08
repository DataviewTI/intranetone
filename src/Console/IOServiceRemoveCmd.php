<?php
namespace Dataview\IntranetOne\Console;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Dataview\IntranetOne\IntranetOne;
use Dataview\IntranetOne\Service;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Illuminate\Support\Str;

class IOServiceRemoveCmd extends Command
{
  protected $signature = "";
  protected $description = "";

  public function __construct($param){
    $this->param = (object) $param;
    $this->signature = 'io-'.(Str::slug($this->param->service)).':remove {--force}';
    $this->description = 'Desinstalação do serviço para IntranetOne - ';
    parent::__construct();
  }
  public function handle()
  {
    $s = Str::slug($this->param->service);
    if(!$this->option('force'))
      $exec = $this->confirm('Tem certeza que deseja remover o serviço? [y|N]');
    else
      $exec = $this->option('force'); 

    if($exec){
      // if(Schema::hasTable(str_plural($s))){
        // $this->line(implode("-",$this->param->tables));
        foreach($this->param->tables as $t){
          $this->line('Removendo tabela '.$t);
          \DB::statement("SET FOREIGN_KEY_CHECKS=0");
          Schema::dropIfExists($t);
          \DB::statement("SET FOREIGN_KEY_CHECKS=1");
        }
      // }
  
      IntranetOne::installMessages($this);
      Service::where('alias',$s)->forceDelete();

      //remove todas as migrations
      foreach($this->param->tables as $t){
        $this->line('Removendo migração '.$t.' - '.str_singular($t).'...');
        \DB::table('migrations')
          ->where('migration','like','%'.$t.'%')
          ->orWhere('migration','like','%'.str_singular($t).'%')
          ->delete();
      }

        IntranetOne::installMessages($this,1);
        $this->line('Removendo assets...');
        (new Process('npm set progress=false'))->run();
        try{
          (new Process('npm remove intranetone-'.$s))->setTimeout(36000)->mustRun();
        }catch (ProcessFailedException $exception){
          $this->error($exception->getMessage());
        }

        (new Process('npm set progress=true'))->run();
        
        $this->info(' ');
        $this->info('IntranetOne - '.title_case($s).' removido com sucesso! :(');
    }
    else
      $this->info('Remoção cancelada...');
  }
}
