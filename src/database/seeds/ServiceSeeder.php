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
          'alias' => 'dash',
          'trans' => 'Painel',
          'ico' => 'ico-dashboard',
          'description' => 'Dashboard IntranetOne',
          'order' => 0
          ]);
      }
   }
}
