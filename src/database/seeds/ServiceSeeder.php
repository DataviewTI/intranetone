<?php
namespace Dataview\IntranetOne;

use Illuminate\Database\Seeder;
use Dataview\IntranetOne\Service;

class ServiceSeeder extends Seeder
{
    public function run(){
      \DB::table('services')->delete();
      Service::insert([
        [
          'service' => "Dashboard",
          'ico' => 'ico ico-save',
          'description' => 'Dashboard da IntranetOne',
          'order' => 0
        ],
        [//tirar depois
          'service' => "News",
          'ico' => 'ico ico-close',
          'description' => 'Serviço de notícias da IntranetOne',
          'order' => 1
        ]
      ]);
    }
}
