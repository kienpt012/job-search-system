<?php

use Carbon\Carbon;

function array2String($arr)
{
    $string = "";
    for ($j = 0; $j < count($arr); $j++) {
        $string = $string . $arr[$j];
        if ($j != count($arr) - 1) {
            $string = $string . ", ";
        }
    }
    return $string;
}

function formatDateTime($dt)
{
    $res = Carbon::parse($dt)->format('d/m/Y H:i');

    return $res;
}
