<?php
namespace Dataview\IntranetOne;

use Illuminate\Database\Seeder;
use Dataview\IntranetOne\ContentType;
use Carbon\Carbon;

class ContentTypeSeeder extends Seeder
{
    public function run()
    {
      \DB::table('content_types')->delete();
      ContentType::insert([
        [
          'type' => "Geral",
          'created_at' => Carbon::now()->toDateTimeString(),
        ]
      ]);
    }
    
}
