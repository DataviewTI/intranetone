<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\File;

class CreateServicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('services', function(Blueprint $table)
        {
            $table->increments('id');
            $table->string('service',30);
            $table->char('alias',20);
            $table->string('ico');
            $table->string('description')->nullable();
            $table->smallInteger('order')->unsigned()->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
			DB::statement('SET FOREIGN_KEY_CHECKS = 0');
			Schema::dropIfExists('services');
			DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
