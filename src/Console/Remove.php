<?php
namespace Dataview\IntranetOne\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Dataview\IntranetOne\IntranetOneServiceProvider;
use Cartalyst\Sentinel\Laravel\SentinelServiceProvider;
use Illuminate\Support\Facades\Schema;
use Dataview\IntranetOne\IntranetOne;
use Dataview\IntranetOne\DatabaseSeeder;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Dataview\IntranetOne\Service;

class Remove extends Command
{
    protected $signature = 'intranetone:remove';
    protected $description = 'Instalação do pacote Dataview/IntranetOne';
    public function handle()
    {
      if($this->confirm('Gostaria de remover os serviços desta intranet?
Importante:Todos os dados das tabelas serão perdidos!)')){
          $services = Service::where('id','>',1)->get();
          $bar = $this->output->createProgressBar(count($services)+1);
          foreach($services as $s){
            $bar->advance();
            $this->comment(' removendo o serviço '.$s->service);
            Artisan::call('io-'.$s->alias.':remove', ['--force'=>true]);
          }
          $bar->finish();
          $this->info(' IntranetOne removida com sucesso! _|_');
      }
      else{
        $this->info(' ');
        $this->info('IntranetOne removida com sucesso! _|_');
      }
    }
}
