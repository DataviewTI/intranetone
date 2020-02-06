<?php
namespace Dataview\IntranetOne\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Dataview\IntranetOne\IntranetOneServiceProvider;
use Cartalyst\Sentinel\Laravel\SentinelServiceProvider;
use Illuminate\Support\Facades\Schema;
use Dataview\IntranetOne\IntranetOne;
use Dataview\IntranetOne\DatabaseSeeder;
use Dataview\IntranetOne\Service;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;


class Remove extends Command
{
    protected $signature = 'intranetone:remove';
    protected $description = 'Instalação do pacote Dataview/IntranetOne';
    public function handle()
    {
      $services = Service::where('id','>',1)->get();

      if(count($services)){
        if($this->confirm('Gostaria de remover os serviços desta intranet?
          Importante:Todos os dados das tabelas de serviços serão perdidos!)')){
          $services = Service::where('id','>',1)->get();
          $bar = $this->output->createProgressBar(count($services)+1);
          foreach($services as $s){
            $bar->advance();
            $this->comment(' removendo o serviço '.$s->service);
            Artisan::call('io-'.$s->alias.':remove', ['--force'=>true]);
          }
          $bar->finish();
          $this->info(' Todos os serviços removidos com sucesso!');
          }
        }
        
        if($this->confirm('Gostaria de remover a base da IntranetOne?
 Importante:Toda a base de dados deste projeto será zerada!)')){

            $colname = 'Tables_in_'.\DB::getDatabaseName();
            $tables = \DB::select('SHOW TABLES');
            $bar = $this->output->createProgressBar(count($tables)+2);
            foreach($tables as $table){
              $bar->advance();
              $this->comment(' removendo tabela '.$table->{$colname});
              \DB::statement("SET FOREIGN_KEY_CHECKS=0");
              \DB::statement("DROP TABLE ".$table->{$colname});
              \DB::statement("SET FOREIGN_KEY_CHECKS=1");
            }
            $bar->advance();
            $this->line(' desinstalando npm...');
            (new Process('npm set progress=false'))->run();
            try{
              (new Process('npm remove intranetone'))->setTimeout(36000)->mustRun();
            }catch (ProcessFailedException $exception){
              $this->error($exception->getMessage());
            }
            (new Process('npm set progress=true'))->run();
            $bar->finish();
            $this->info(' IntranetOne desinstalada com sucesso!');
        }
    }
}
