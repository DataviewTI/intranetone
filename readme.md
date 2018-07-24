
# IntranetOne
Descrição da IntranetOne

IntranetOne requires PHP >= 7.1.3

## Conteúdo
 
- [IntranetOne](#intranetone)
  - [Conteúdo](#conte%C3%BAdo)
  - [Preparação do Ambiente](#prepara%C3%A7%C3%A3o-do-ambiente)
  - [Instalação](#instala%C3%A7%C3%A3o)
  - [Webpack](#webpack)

## Preparação do Ambiente

Devido a geração automática de alguns arquivos, são necessárias algumas configurações manuais, conforme abaixo:

###Configurações no .ENV
- Configure a conexão com o banco de dados no .ENV. 
- Configure a conexão com o servidor SMTP para envio de emails no .ENV (MAIL_DRIVER, MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_ENCRYPTION). 
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
Após a instalação, altere o *User Resolver* no arquivo de configuração config/audit.php
```php
return [
    ...

    'resolver' = [
        ...
        'user' => Dataview\IntranetOne\Resolvers\UserResolver::class,
        ...
    ],

    ...
];
```
Configure o Model app/User.php para extender a classe EloquentUser 
```php
use Cartalyst\Sentinel\Users\EloquentUser as EloquentUser;
...
class User extends EloquentUser
{
...
```

## Webpack

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