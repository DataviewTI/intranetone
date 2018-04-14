<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateVideosTable extends Migration
{
    public function up()
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->increments('id');
            $table->string('url');
            $table->char('source',20);
            $table->string('title')->nullable();
            $table->date('date')->nullable();
            $table->text('description')->nullable();
            $table->char('start_at',8)->default('00:00:00');
            $table->longText('thumbnail');
            $table->integer('order')->unsigned()->default(0);
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
        Schema::dropIfExists('videos');
    }
}
