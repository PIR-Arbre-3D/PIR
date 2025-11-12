<?php

declare(strict_types=1);

require_once 'flight/Flight.php';
// require 'flight/autoload.php';

Flight::route('/', function () {
    if (isset($_GET['nb'])) {
        $nb = $_GET['nb'];
    } else {
        $nb = 0;
    };
    Flight::render('accueil', ['nb' => $nb]);
});

Flight::start();
