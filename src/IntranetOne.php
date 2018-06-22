<?php
namespace Dataview\IntranetOne;

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

  static function installMessages($cmd,$len=4,$posdelay=1){
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
      "Challenging everything..."
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
