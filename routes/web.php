<?php


use App\Http\Controllers\EmployeeController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/', [EmployeeController::class, 'index']);
Route::post('/store', [EmployeeController::class, 'store']);
Route::post('/update/{id}', [EmployeeController::class, 'update']);

Route::post('/delete/{id}', [EmployeeController::class, 'destroy']);
