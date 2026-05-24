<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/cv_images/{filename}', function ($filename) {
    if (!preg_match('/^[A-Za-z0-9._-]+$/', $filename)) {
        abort(404);
    }

    $path = storage_path('cv_images/' . $filename);
    if (!File::exists($path)) {
        abort(404);
    }

    return response()->file($path, [
        'Content-Type' => 'application/pdf',
        'Content-Disposition' => 'inline; filename="' . $filename . '"',
    ]);
});

Route::get('/company_logos/{filename}', function ($filename) {
    if (!preg_match('/^[A-Za-z0-9._-]+$/', $filename)) {
        abort(404);
    }

    $path = storage_path('company_logos/' . $filename);
    if (!File::exists($path)) {
        abort(404);
    }

    return response()->file($path);
});

Route::get('/company_covers/{filename}', function ($filename) {
    if (!preg_match('/^[A-Za-z0-9._-]+$/', $filename)) {
        abort(404);
    }

    $path = storage_path('company_covers/' . $filename);
    if (!File::exists($path)) {
        abort(404);
    }

    return response()->file($path);
});

Route::get('/hero_slides/{filename}', function ($filename) {
    if (!preg_match('/^[A-Za-z0-9._-]+$/', $filename)) {
        abort(404);
    }

    $path = storage_path('hero_slides/' . $filename);
    if (!File::exists($path)) {
        abort(404);
    }

    return response()->file($path);
});

Route::get('/employer_documents/{filename}', function ($filename) {
    if (!preg_match('/^[A-Za-z0-9._-]+$/', $filename)) {
        abort(404);
    }

    $path = storage_path('employer_documents/' . $filename);
    if (!File::exists($path)) {
        abort(404);
    }

    return response()->file($path);
});
