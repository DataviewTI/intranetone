# IntranetOne

Intranet One Laravel 7 Support

```php
composer require dataview/intranetone dev-master
```

- requires PHP >= 7.2.5
- for laravel 5.6 or earlier, use 1.0 version

```php
composer require dataview/intranetone 1.0.0
```

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

- Antes de executar o webpack, faça a instalação dos pacotes NPM

```sh
npm install
```

- Configure o webpack conforme abaixo

```js
let io = require("intranetone");
let user = require("intranetone-user");
let config = require("intranetone-config");
io.compile({
  services: [new user(), new config()],
});
```

- Compile os assets e faça o cache

```sh
npm run dev|prod|watch
php artisan config:cache
```

## Configurações server em produção King Host

- ssh ftp.site.com.br -l site
- Clone o repositório
- baixe e instale o composer

```sh
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
```

- Execute o composer

```sh
php -d memory_limit="1G" composer.phar install
```

- mover os arquivos para a www

```sh
cp -rf pacote/* www
```

- criar link simbolico

```sh
ln -s www/storage/app/public www/public/storage
```
