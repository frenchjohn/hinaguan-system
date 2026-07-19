<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();

            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('age')->nullable();

            $table->enum('gender', ['Male', 'Female']);

            // 0 = Filipino, 1 = Foreigner
            $table->boolean('is_foreigner')->default(false);

            $table->string('phone')->nullable();
            $table->string('email')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};