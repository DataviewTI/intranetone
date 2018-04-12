<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
			Schema::create('files', function(Blueprint $table)
			{
				$table->increments('id');
				$table->string('file');
				$table->integer('group_id')->unsigned()->nullable();
				$table->string('caption')->nullable();
				$table->date('date')->nullable();
				$table->text('details')->nullable();
                $table->char('mimetype',100)->nullable();
				$table->integer('order')->unsigned()->default(0);
				$table->timestamps();
				$table->softDeletes();
				$table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade')->onUpdate('cascade');
			});
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
			Schema::dropIfExists('files');
    }
}
