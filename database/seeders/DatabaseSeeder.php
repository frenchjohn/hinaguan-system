<?php

namespace Database\Seeders;

use App\Models\AdminAccount;
use App\Models\StaffAccount;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        StaffAccount::create([
            'name' => 'Staff User',
            'email' => 'staff@example.com',
            'password' => Hash::make('staff1234'),
        ]);

        AdminAccount::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin1234'),
        ]);
    }
}
