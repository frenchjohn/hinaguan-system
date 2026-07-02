<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReservationGuest extends Model
{
    use HasFactory;

    protected $table = 'reservation_guests';

    protected $fillable = [
        'reservation_id',
        'customer_id',
        'is_primary_guest',
    ];
}
