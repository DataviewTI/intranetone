<?php
namespace Dataview\IntranetOne;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
      $this->call(AdminSeeder::class);
      //$this->call(ContentTypeSeeder::class);
      //$this->call(CategorySeeder::class);
      $this->call(ServiceSeeder::class);
    }
}
