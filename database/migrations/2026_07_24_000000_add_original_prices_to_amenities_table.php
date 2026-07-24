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
        Schema::table('amenities', function (Blueprint $table) {
            $table->decimal('original_daytime_price', 10, 2)->nullable()->after('daytime_price');
            $table->decimal('original_nighttime_price', 10, 2)->nullable()->after('nighttime_price');
            $table->decimal('original_daytime_aircon_price', 10, 2)->nullable()->after('daytime_aircon_price');
            $table->decimal('original_nighttime_aircon_price', 10, 2)->nullable()->after('nighttime_aircon_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('amenities', function (Blueprint $table) {
            $table->dropColumn(['original_daytime_price', 'original_nighttime_price', 'original_daytime_aircon_price', 'original_nighttime_aircon_price']);
        });
    }
};
