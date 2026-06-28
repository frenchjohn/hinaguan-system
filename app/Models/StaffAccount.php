<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffAccount extends Model
{
    use HasFactory;

    protected $table = 'staff_accounts';

    protected $fillable = [
        'name',
        'email',
        'password',
        'ban_status',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'ban_status' => 'boolean',
    ];
}
