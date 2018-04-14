<?php
namespace Dataview\IntranetOne\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Dataview\IntranetOne\IntranetOneServiceProvider;

class InstallCommand extends Command
{
    protected $name = 'intranetone:install';

    protected $description = 'Instalação do pacote Dataview/IntranetOne';

    public function handle()
    {
        $this->info('Publicando os arquivos de configuração...');
        Artisan::call('vendor:publish', [
            '--provider' => IntranetOneServiceProvider::class,
        ]);

        $this->info('Publicando providers de terceiros...');
        Artisan::call('vendor:publish', [
            '--provider' => Cartalyst\Sentinel\Laravel\SentinelServiceProvider::class,
        ]);
        Artisan::call('auditing:install');

        $this->info('Criando simlink');
        Artisan::call('storage:link');

        $this->info('Atualizando config');
        Artisan::call('config:cache');

        $this->info('IntranetOne Instalada com sucesso! _|_');
    }
}
