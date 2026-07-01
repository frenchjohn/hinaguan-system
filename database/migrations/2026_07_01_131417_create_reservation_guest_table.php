<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservation_guests', function (Blueprint $table) {
            $table->id();

            $table->string('reservation_id');
            $table->string('customer_id');

            $table->boolean('is_primary_guest')->default(false);

            $table->timestamps();

            $table->foreign('reservation_id')
                ->references('id')
                ->on('reservations')
                ->cascadeOnDelete();

            $table->foreign('customer_id')
                ->references('id')
                ->on('customers')
                ->cascadeOnDelete();

            // Prevent duplicate customer-reservation pairs
            $table->unique(['reservation_id', 'customer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_guests');
    }
};