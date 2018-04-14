
# IntranetOne
Descrição da IntranetOne
IntranetOne requires PHP >= 7.1.3

## Conteúdo
 
-  [Instalação](#instalação)
-  [Migração](#migração) 
 - [Assets](#assets) 

### Instalação
```sh
composer require dataview/intranetone
```

Instalar o IntranetOne com php artisan
```sh
php artisan intranetone:install
```


**Configurações manuais**
  
  

 - Adicionar as seguintes linhas ao App/Http/Kernel.php in $routeMiddleware
	 ```php
	'admin' => \App\Http\Middleware\SentinelAdmin::class,`
 - Configurar config/filesystem.php, alterar o default manualmente ou no .env
	 ```php
	 'intranetone' => [
          'driver' => 'local',
          'root' => storage_path('app/public/intranetone'),
          'url' => env('APP_URL').'/storage/app/public/intranetone',
          'visibility' => 'public',
        ],

### Migração

 -  deletar da pasta de migrations o arquivo:
	 `2014_10_12_000000_create_users_table`
	 
 - Adições ao App/Providers/AppServiceProvider

	 ```php
		use Illuminate\Support\Facades\Schema;
		...
		public  function  boot(){
			...
			Schema::defaultStringLength(191);
			if(env('APP_ENV')=='production')
			\URL::forceScheme('https');
			}

 - Executar migração com php artisan
	`php artisan migrate`

 - Fazer a seed dos dados padrão
	 `php artisan db:seed --class=Dataview\IntranetOne\DatabaseSeeder -v`

## Assets

 - Instalar node modules para webpack
 `npm install yarn cross-env babel-preset-es2015 laravel-mix copy-webpack-plugin
    imagemin-webpack-plugin imagemin-jpegtran imagemin-pngquant imagemin-mozjpeg
    imagemin-webp uglifyjs-webpack-plugin --save`
    
 - Instalar pacote js da intranetone
 `bower install dataview-intranetone --save`

### Configurações Manuais

Abrir o package em "resources/vendors/dataview-intranetone/src/" e copiar o conteúdo do arquivo webpackmix.js e/ou subscrever o do projeto.

 - Compilar os assets e fazer cache
 `npm run dev|prod|watch`
 `php artisan config:cache`
 