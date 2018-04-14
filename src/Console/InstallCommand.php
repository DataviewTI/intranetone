<?php
namespace Dataview\IntranetOne\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Dataview\IntranetOne\IntranetOneServiceProvider;
use Cartalyst\Sentinel\Laravel\SentinelServiceProvider;

class InstallCommand extends Command
{
    protected $name = 'intranetone:install';

    protected $description = 'Instalação do pacote Dataview/IntranetOne';
    public function handle()
    {
      $loops = [1,2,3,4,5];
      $msg = [
        "Love is: never having to say XX% loaded...",
        "Breaking water...",
        "Getting stuck in traffic...",
        "Dividing by 0...",
        "Crying over spilled milk...",
        "Generating Lex's voice",
        "Patching Conics...",
        "Just a minute, while I dig the dungeon...",
        "disinfecting germ cells...",
        "Spinning up the hamster...",
        "Programming the flux capacitor...",
        "640K ought to be enough for anybody...",
        "Checking the gravitational constant in your locale...",
        "Dig on the 'X' for buried treasure... ARRR!...",
        "It's still faster than you could draw it..."
      ];

      $this->info('Publicando os arquivos de configuração...');
        
        $i = array_random($loops);
        while($i--){
          sleep(array_random($loops));
          $this->info(array_random($msg));
        }
        sleep(1);

        Artisan::call('vendor:publish', [
            '--provider' => IntranetOneServiceProvider::class,
        ]);

        $this->info('Publicando providers de terceiros...');
        Artisan::call('vendor:publish', [
            '--provider' => SentinelServiceProvider::class,
        ]);

        Artisan::call('auditing:install');

        $i = array_random($loops);
        while($i--){
          sleep(array_random($loops));
          $this->info(array_random($msg));
        }
        sleep(1);

        $this->info('Criando simlink...');
        Artisan::call('storage:link');

        //$this->info('Atualizando config');
        //Artisan::call('config:cache');

        $this->info(' ');
        $this->info('IntranetOne Instalada com sucesso! _|_');
    }
}
