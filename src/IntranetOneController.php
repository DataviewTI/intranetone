<?php
namespace Dataview\IntranetOne;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class IntranetOneController extends Controller
{

  static function getServices(){

    return DB::table('services')
    ->select('service','ico','alias','trans','description')
    ->orderBy('order')
    ->distinct()
    ->get();

  }

}
