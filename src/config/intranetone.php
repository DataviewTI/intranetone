<?php
/*
|--------------------------------------------------------------------------
| Dataview IntranetOne Configs
|--------------------------------------------------------------------------
*/

return [
    'client' =>[
      "name"=>"Nome do Sistema",
      "address"=>"Av. X, nº 0000",
      "address2"=>"Centro",
      "full_address"=>"Endereço completo ...",
      "zipcode"=>"00000-000",
      "city"=>"Nome da Cidade",
      "state"=>"UF",
      "phone"=>"00 0000-0000",
      "mobile"=>"11 1111 1111",
      "whatsapp"=>"22 2222 2222",
      "email"=>"email@nomedosistema.com",
      "email2"=>"",
      "cnpj"=>""
    ],
    'path_storage' => 'app/public/intranetone/',
    'social_media'=>[
      'facebook'=>[
        'app_id'=>'000000000000000',
        'app_version'=>'v2.11',
        'long_token' =>'informe o long token',
        "locale"=>"pt_BR",
        'publisher'=>""
      ],
      'twitter'=>[
        'user'=>'',
        'publisher'=>""
      ],
      'google'=>[
        'UA'=>'teste'
      ]
    ],
    'gallery' => [
      'crop' => [
        'activate' => false,
        'aspect_ratio_x' => '1',
        'aspect_ratio_y' => '1',
      ]
    ],
    'news' => [
      'crop' => [
        'activate' => false,
        'aspect_ratio_x' => '1',
        'aspect_ratio_y' => '1',
      ]
    ]

  ];

