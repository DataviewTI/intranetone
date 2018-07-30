<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AlterAuditsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('ALTER TABLE audits CHANGE old_values old_values LONGTEXT;');
        DB::statement('ALTER TABLE audits CHANGE new_values new_values LONGTEXT;');

        //doesnt work 
        // Schema::table('audits', function (Blueprint $table) {            
        //     $table->longText('old_values')->change();
        //     $table->longText('new_values')->change();
        // });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
