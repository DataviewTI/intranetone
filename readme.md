
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

- Configure o arquivo config/filesystem.php, adicione o código abaixo ao array "disks"

```php
'intranetone' => [
      'driver' => 'local',
      'root' => storage_path('app/public/intranetone'),
      'url' => env('APP_URL').'/storage/app/public/intranetone',
      'visibility' => 'public',
],
```

- Configure o arquivo config/app.php, altere a linguagem local para pt-BR

```php
'locale' => 'pt-BR',
```

- Adicione as seguintes linhas ao App/Providers/AppServiceProvider

```php
use Illuminate\Support\Facades\Schema;
...
public  function  boot(){
...
  Schema::defaultStringLength(191);
```
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

- Instale o pacote de assets da intranetone via NPM

```sh
npm install assets-intranetone --save
```

- Configure o webpack conforme abaixo 
```js
let io = require('intranetone');
io.compile();
```
- Compile os assets e faça o cache
```sh
npm run dev|prod|watch
php artisan config:cache
```