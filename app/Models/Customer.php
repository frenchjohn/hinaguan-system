<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $table = 'customers';

    protected $fillable = [
        'id',
        'first_name',
        'middle_name',
        'last_name',
        'age',
        'gender',
        'nationality',
        'is_foreigner',
        'phone',
        'email',
    ];

    public function reservationGuests()
    {
        return $this->hasMany(ReservationGuest::class, 'customer_id');
    }

    public function reservations()
    {
        return $this->belongsToMany(Reservation::class, 'reservation_guests')
            ->withPivot(['is_primary_guest'])
            ->withTimestamps();
    }
}
