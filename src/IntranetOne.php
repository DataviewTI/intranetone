<?php
namespace Dataview\IntranetOne;
use Illuminate\Support\Facades\DB;

class IntranetOne
{
  /** return routes by type */
  static function getDataType($data=[],$type=null){
    switch($type){
      case 'datatables':  
        return DataTables::of(collect($data))->make(true);
      default:
        return json_encode($data);
    }
  }
  
  static function getEnumValues( $table, $field ){
    $type = DB::select( DB::raw("SHOW COLUMNS FROM {$table} WHERE Field = '{$field}'") )[0]->Type;
    preg_match("/^enum\(\'(.*)\'\)$/", $type, $matches);
    $enum = explode("','", $matches[1]);
    return $enum;
  }

  static function installMessages($cmd,$len=3,$posdelay=1){
    $msg = [
      "Analyzing coffee quality...",
      "Spending a precious time...",
      "Getting stuck in traffic...",
      "Dividing by 0...",
      "Crying over spilled milk...",
      "Generating Lex's voice",
      "Patching Conics...",
      "Just a minute, while I dig the dungeon...",
      "Disinfecting germ cells...",
      "Spinning up the hamster...",
      "Programming the flux capacitor...",
      "Checking the gravitational constant in your locale...",
      "Shaking...",
      "Revolving independence...",
      "Tokenizing innovation...",
      "Spinning violently around the y-axis...",
      "Bending the spoon...",
      "Filtering moral...",
      "Swapping time and space...",
      "Stretching images...",
      "Constructing non-linear narrative...",
      "Scraping funds...",
      "Dissolving relationships...",
      "Iodizing...",
      "Distilling beauty...",
      "Constructing emotional depth...",
      "Exceeding cpu quota...",
      "Challenging everything...",
      "Waiting for the system admin to hit enter...",
      "Warming up the processors...",
      "RE-calibrating the internet...",
      "Please don't move...",
      "Testing for perfection...",
      "Making you a cookie...",
      "Improving your reading skills...",
      "Waiting for approval from Bill Gates...",
      "Buy more RAM...",
      "Loading loading messages...",
      "Spinning the wheel of fortune...",
      "Preparing for hyperspace jump...",
      "Searching for the Amulet of Yendor...",
    ];

    $i = mt_rand(1,$len);
    shuffle($msg);
    while($i--){
      sleep(mt_rand(1,$len));
      $cmd->comment(array_shift($msg));
    }
    sleep($posdelay);
  }

}
