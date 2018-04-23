<?php
namespace Dataview\IntranetOne;

use Illuminate\Database\Seeder;
use Dataview\IntranetOne\Service;

class ServiceSeeder extends Seeder
{
    public function run(){

      if(!Service::where('service','Dashboard')->exists()){
        Service::insert([
          'service' => "Dashboard",
          'ico' => 'ico ico-save',
          'description' => 'Dashboard da IntranetOne',
          'order' => 0
          ]);
      }
   }
}
