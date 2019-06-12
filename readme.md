# IntranetOne

Descrição da IntranetOne

IntranetOne requires PHP >= 7.1.3

## Conteúdo

- [IntranetOne](#intranetone)
  - [Conteúdo](#conte%C3%BAdo)
  - [Preparação do Ambiente](#prepara%C3%A7%C3%A3o-do-ambiente)
  - [Configurações no .ENV](#configura%C3%A7%C3%B5es-no-env)
  - [Instalação](#instala%C3%A7%C3%A3o)
  - [Webpack](#webpack)

## Preparação do Ambiente

Devido a geração automática de alguns arquivos, são necessárias algumas configurações manuais, conforme abaixo:

## Configurações no .ENV

- Configure a conexão com o banco de dados e adicione as seguintes linhas ao .ENV.

```php
FILESYSTEM_DRIVER = intranetone
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

Após a instalação, altere o _User Resolver_ no arquivo de configuração config/audit.php

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

Altere o _User Model_ no arquivo de configuração config/cartalyst.sentinel.php

```php
return [
    ...

    'users' => [

        'model' => 'Dataview\IntranetOne\User',

    ],

    ...
];
```

Carregar as configurações

```sh
php artisan config:cache
```

## Webpack

- Configure o webpack conforme abaixo

```js
let io = require("intranetone");
io.compile();
```

- Compile os assets e faça o cache

```sh
npm run dev|prod|watch
php artisan config:cache
```
