<?php

namespace Dataview\IntranetOne;

use App\Http\Controllers\Controller;

use Carbon\Carbon;

class IntranetOneController extends Controller
{
    public function index($timezone)
    {
        echo Carbon::now($timezone)->toDateTimeString();
    }
}
