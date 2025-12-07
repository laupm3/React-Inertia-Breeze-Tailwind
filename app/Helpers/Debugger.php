<?php

use Illuminate\Support\Facades\Storage;

if (!function_exists('dd_as_json')) {


    function dd_as_json(mixed ...$vars)
    {
        $json = json_encode($vars, JSON_PRETTY_PRINT);

        $filename = 'dump_' . time() . '.json';

        // Check if the disk exists
        if (!Storage::disk('testing')->exists('')) {
            Storage::disk('testing')->makeDirectory('');
        }

        Storage::disk('testing')->put($filename, $json);

        exit(1);
    }
}

if (!function_exists('dump_as_json')) {


    function dump_as_json(mixed ...$vars)
    {
        $json = json_encode($vars, JSON_PRETTY_PRINT);

        $filename = 'dump_' . time() . '.json';

        // Check if the disk exists
        if (!Storage::disk('testing')->exists('')) {
            Storage::disk('testing')->makeDirectory('');
        }

        Storage::disk('testing')->put($filename, $json);
    }
}
