
# IntranetOne
Descrição da IntranetOne

IntranetOne requires PHP >= 7.1.3

## Conteúdo
 
- [Preparação do Ambiente](#Preparação do Ambiente)
- [Instalação](#instalação)
- [Assets](#assets) 

## Preparação do Ambiente

Devido a geração automática de alguns arquivos, são necessárias algumas configurações manuais, conforme abaixo:

  ###Configurações no .ENV
   - Configure a conexão com o banco de dados no .ENV. 
   - defina FILESYSTEM_DRIVER = intranetone


 <!-- - Adicione as seguintes linhas ao App/Http/Kernel.php in $routeMiddleware
	 ```php
	'admin' => \App\Http\Middleware\SentinelAdmin::class, -->

 - Configure o arquivo config/filesystem.php, adicione o código abaixo ao array "disks"
	 ```php
	 'intranetone' => [
          'driver' => 'local',
          'root' => storage_path('app/public/intranetone'),
          'url' => env('APP_URL').'/storage/app/public/intranetone',
          'visibility' => 'public',
    ],

 - Configure o arquivo config/app.php, altere a linguagem local para pt-BR
	 ```php
       'locale' => 'pt-BR',


 - Adicione as seguintes linhas ao App/Providers/AppServiceProvider

	 ```php
		use Illuminate\Support\Facades\Schema;
		...
		public  function  boot(){
			...
			Schema::defaultStringLength(191);
			
<!-- if(env('APP_ENV')=='production')
				\URL::forceScheme('https');  -->

## Instalação
```sh
composer require dataview/intranetone
```

Durante a instalação o processo de migração e seeds já é realizado automaticamente, tanto para a IntranetOne quanto para os pacotes de terceiros requeridos (Sentinel Cartalyst e Own-Audits)

Instalar o IntranetOne com php artisan
```sh
php artisan intranetone:install
```

## Assets

 - Instalar node modules para webpack
 `npm install yarn browser-sync cross-env babel-preset-es2015 laravel-mix copy-webpack-plugin
    imagemin-webpack-plugin imagemin-jpegtran imagemin-pngquant imagemin-mozjpeg
    imagemin-webp uglifyjs-webpack-plugin --save`
    
 - Instalar pacote js da intranetone
 `bower install dataview-intranetone --save`

### Configurações Manuais

Abra o package em "resources/vendors/dataview-intranetone/src/" e copiar o conteúdo do arquivo webpackmix.js e/ou subscrever o do projeto.

 - Compilar os assets e fazer cache
 `npm run dev|prod|watch`
 `php artisan config:cache`
 