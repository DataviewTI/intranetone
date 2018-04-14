<?php
namespace Dataview\IntranetOne;

use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(){
      \DB::table('categories')->delete();
      $cats = ['Categoria A','Categoria B','Categoria C'];

      $ctype = ContentType::first()->id;
      foreach($cats as $c){
        Category::create([
          'content_type_id' => ContentType::first()->id,
          'category' => $c,
          'category_slug' => str_slug($c),
        ]);
      }
    }
}
