<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCategoriesTable extends Migration
{
    public function up(){
			Schema::create('categories', function (Blueprint $table) {
				$table->increments('id');
				//$table->integer('content_type_id')->unsigned();
				$table->integer('service_id')->nullable()->unsigned();
				$table->integer('category_id')->nullable()->unsigned();
				$table->char('category',60);
				$table->char('category_slug',60);
				$table->text('description')->nullable();
				$table->text('config')->default('{}');
				$table->integer('order')->unsigned()->default(0);
				$table->boolean('erasable')->default(true);
				$table->timestamps();
				$table->softDeletes();
			});

			//create self relationship
			Schema::table('categories', function (Blueprint $table) {
				$table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade')->onUpdate('cascade');
			});

			/*Schema::table('categories', function (Blueprint $table) {
				$table->foreign('content_type_id')->references('id')->on('content_types')->onDelete('cascade')->onUpdate('cascade');
			});*/
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
		 Schema::dropIfExists('categories');
    }
}
