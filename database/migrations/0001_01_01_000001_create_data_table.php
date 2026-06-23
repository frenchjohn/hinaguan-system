<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration')->index();
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration')->index();
        });

        Schema::create('amenities', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('amenities_name');
            $table->string('daytime_price');
            $table->string('nighttime_price');
            $table->string('daytime_aircon_price')->nullable();
            $table->string('nighttime_aircon_price')->nullable();
            $table->string('description')->nullable();
            $table->string('image')->nullable();
            $table->boolean('status')->default(true); // true = enabled, false = disabled
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cache');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('amenities');
    }
};
