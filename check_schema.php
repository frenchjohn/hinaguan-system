<?php

$conn = new mysqli('localhost', 'root', '', 'hinaguan_db');
$result = $conn->query('DESCRIBE reservations');
while ($row = $result->fetch_assoc()) {
    if (strpos($row['Field'], 'check') !== false || $row['Field'] === 'reservation_date') {
        echo $row['Field'] . ' -> ' . $row['Type'] . PHP_EOL;
    }
}
