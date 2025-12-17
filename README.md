# PHP_Laravel12_Select2_Implement_Using_React.JS
---
## A Laravel 12 project demonstrating:

CRUD operations (Create, Read, Update, Delete) for employees.

ReactJS frontend with dynamic UI.

Select2-style multi-select dropdown using react-select for skills.

Bootstrap 5 for responsive styling.

Soft deletes to logically delete employees while keeping records in the database.

---

## Project Purpose

This project simulates a real-world employee management system. Key features include:

Multi-select Skills: Employees can have multiple skills. React handles selection dynamically, and Laravel stores them as JSON in the database.

Soft Deletes: When deleting an employee, the record is not removed but marked as deleted (status='deleted') and soft-deleted. This allows future recovery or auditing.

Dynamic CRUD UI: React provides a responsive table and forms for creating, editing, and deleting employees without leaving the page unnecessarily.

Integration of React and Laravel: Blade is used to pass backend data (employees) to React. React handles the interactive part.





## Step 1 - Create Laravel 12 Project
```
composer create-project laravel/laravel PHP_Laravel12_Select2_Implement_Using_React.JS "12.*"
cd PHP_Laravel12_Select2_Implement_Using_React.JS
```

Explanation:

Creates a fresh Laravel 12 project in a folder named PHP_Laravel12_Select2_Implement_Using_React.JS.

cd moves into the project directory.


## Step 2 — Configure Database

Open the `.env` file and update the database credentials:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=select2_implement_reactjs
DB_USERNAME=root
DB_PASSWORD=
```

Create the database in MySQL:

```
CREATE DATABASE select2_implement_reactjs;
```

Explanation:
This configures Laravel to connect to your MySQL database. The DB_DATABASE name must match the one you create.


## Step 3 - Install React (Vite)

```
npm install
npm install react-select
```

Explanation:

Installs project dependencies for React + Vite.

react-select is used for multi-select dropdowns (Select2-style).



## Step 4 - Create Migration

### Run Command:
```
php artisan make:migration create_employees_table

```
### database/migrations/xxxx_create_employees_table.php
```
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('employees', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->string('mobile_no');
        $table->text('skills'); // JSON string
        $table->enum('status', ['active', 'deleted'])->default('active');
        $table->softDeletes(); // soft delete
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
```

Explanation:

skills is stored as a JSON string.

status tracks active/deleted employees.

softDeletes() allows "soft deletion" without removing records from the database.


### Run:
```
php artisan migrate
```


## Step 5 - Create Model

### Run Command:
```
php artisan make:model Employee
```

### app/Models/Employee.php
```

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'mobile_no',
        'skills',
        'status'
    ];
}

```
Explanation:

SoftDeletes enables soft deletion.

$fillable allows mass assignment when creating/updating employees.




## Step 6 - Create Controller

### Run Command:
```
php artisan make:controller EmployeeController


```
### app/Http/Controllers/EmployeeController.php
```
<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Show all employees (active + soft-deleted if needed)
     */
    public function index()
    {
        // Only active employees for main table
        $employees = Employee::where('status', 'active')->get();

        // If you want to include soft-deleted:
        // $employees = Employee::withTrashed()->get();

        return view('employees.index', compact('employees'));
    }

    /**
     * Store a new employee
     */
    public function store(Request $request)
    {
        //  Validate input
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email',
            'mobile_no' => 'required|string|max:20',
            'skills' => 'required|array',
        ]);

        //  Create employee
        $employee = Employee::create([
            'name' => $request->name,
            'email' => $request->email,
            'mobile_no' => $request->mobile_no,
            'skills' => json_encode($request->skills), // convert array → JSON
            'status' => 'active',
        ]);

        // Redirect back with success message
        return redirect()->back()->with('success', 'Employee created successfully!');
    }

    /**
     * Update an existing employee
     */
    public function update(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);

        //  Validate input, ignore current employee's email for uniqueness
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email,' . $employee->id,
            'mobile_no' => 'required|string|max:20',
            'skills' => 'required|array',
        ]);

        //  Update employee
        $employee->update([
            'name' => $request->name,
            'email' => $request->email,
            'mobile_no' => $request->mobile_no,
            'skills' => json_encode($request->skills),
        ]);

        return redirect()->back()->with('success', 'Employee updated successfully!');
    }

    /**
     * Soft delete an employee
     */
    public function destroy($id)
    {
        $employee = Employee::findOrFail($id);

        //  Mark status as deleted
        $employee->update(['status' => 'deleted']);

        //  Soft delete
        $employee->delete();

        return redirect()->back()->with('success', 'Employee deleted successfully!');
    }
}
```

Explanation:

Uses json_encode to store multiple skills.

Redirects back to the index page after CRUD operations.




## STEP 7 - Define Routes

### Update routes/web.php:
```
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

```

Explanation:

Routes handle displaying the table, storing, updating, and deleting employees.

Delete and update use POST for HTML forms with CSRF protection.




## STEP 8 - Blade View

### resources/views/employees/index.blade.php
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel + React Employee CRUD</title>

    <!--  CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

    <!--  React + Vite -->
    @viteReactRefresh
    @vite('resources/js/app.jsx')
</head>
<body>

    <!-- React App Root -->
    <div id="app" data-employees='@json($employees)'></div>

    <!--  Bootstrap 5 JS Bundle CDN (includes Popper) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```
Explanation:

@viteReactRefresh + @vite loads React with Vite.

CSRF meta tag is required for POST forms.


## STEP 9 - React Entry File

### resources/js/app.jsx
```
import './bootstrap'; // already present
import 'bootstrap/dist/css/bootstrap.min.css'; //  Bootstrap CSS
import React from "react";
import { createRoot } from "react-dom/client";
import EmployeeCrud from "./EmployeeCrud";

const el = document.getElementById("app");
const employees = JSON.parse(el.dataset.employees);

createRoot(el).render(
    <EmployeeCrud employees={employees} />
);
```
Explanation:

React handles the frontend UI dynamically.

Multi-select skills are converted to hidden inputs for Laravel backend.



### resources/js/EmployeeCrud.jsx

```
import React, { useState } from "react";
import Select from "react-select";
import { PencilSquare, Trash3 } from "react-bootstrap-icons"; // optional icons

const skillOptions = [
  { value: "php", label: "PHP" },
  { value: "laravel", label: "Laravel" },
  { value: "react", label: "React" },
  { value: "mysql", label: "MySQL" },
];

export default function EmployeeCrud({ employees }) {
  const [page, setPage] = useState("index");
  const [skills, setSkills] = useState([]);
  const [editEmployee, setEditEmployee] = useState(null);

  const convertSkillsToSelect = (savedSkills) => {
    return skillOptions.filter((opt) => savedSkills.includes(opt.value));
  };

  /* ================= INDEX PAGE ================= */
  if (page === "index") {
    return (
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-primary">Employee Management</h3>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              setEditEmployee(null);
              setSkills([]);
              setPage("form");
            }}
          >
            + Add Employee
          </button>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Skills</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const empSkills = JSON.parse(emp.skills);
                    return (
                      <tr key={emp.id}>
                        <td>{emp.id}</td>
                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.mobile_no}</td>
                        <td>{empSkills.join(", ")}</td>
                        <td>
                          <span
                            className={`badge ${
                              emp.status === "active"
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="text-center">
                          {emp.status === "active" && (
                            <>
                              <button
                                className="btn btn-outline-success btn-sm me-2"
                                onClick={() => {
                                  setEditEmployee(emp);
                                  setSkills(convertSkillsToSelect(empSkills));
                                  setPage("form");
                                }}
                                title="Edit"
                              >
                                <PencilSquare />
                              </button>

                              <form
                                method="POST"
                                action={`/delete/${emp.id}`}
                                style={{ display: "inline" }}
                                onSubmit={(e) => {
                                  if (!window.confirm("Are you sure?"))
                                    e.preventDefault();
                                }}
                              >
                                <input
                                  type="hidden"
                                  name="_token"
                                  value={document.querySelector(
                                    'meta[name="csrf-token"]'
                                  ).content}
                                />
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  title="Delete"
                                >
                                  <Trash3 />
                                </button>
                              </form>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= CREATE / EDIT PAGE ================= */
  return (
    <div className="container my-5">
      <div className="card shadow mx-auto" style={{ maxWidth: "600px" }}>
        <div className="card-header bg-primary text-white text-center">
          <h4 className="mb-0">
            {editEmployee ? "Edit Employee" : "Create Employee"}
          </h4>
        </div>

        <div className="card-body">
          <form
            method="POST"
            action={editEmployee ? `/update/${editEmployee.id}` : "/store"}
          >
            <input
              type="hidden"
              name="_token"
              value={document.querySelector('meta[name="csrf-token"]').content}
            />

            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-lg"
                name="name"
                placeholder="Full Name"
                defaultValue={editEmployee?.name || ""}
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="email"
                className="form-control form-control-lg"
                name="email"
                placeholder="Email Address"
                defaultValue={editEmployee?.email || ""}
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-lg"
                name="mobile_no"
                placeholder="Mobile Number"
                defaultValue={editEmployee?.mobile_no || ""}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Skills</label>
              <Select
                isMulti
                options={skillOptions}
                value={skills}
                onChange={setSkills}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>

            {skills.map((s, i) => (
              <input key={i} type="hidden" name="skills[]" value={s.value} />
            ))}

            <div className="d-flex justify-content-between mt-4">
              <button type="submit" className="btn btn-success btn-lg">
                {editEmployee ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => setPage("index")}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```
Explanation:

Axios is ready for any future AJAX requests.

Bootstrap JS includes components like modals and dropdowns.



## Step 10 - Install for Design
```

npm install bootstrap@5.3.2 react-select
>npm install react-bootstrap-icons
```
### resources/js/bootstrap.js
```
import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// resources/js/bootstrap.js

import 'bootstrap/dist/js/bootstrap.bundle.min.js';
```

Explanation:

Bootstrap provides styling, and react-bootstrap-icons gives icons for edit/delete buttons.



## STEP 11 - Run Project

### Run:
```
php artisan serve
npm run dev
```

### Open:
```
http://127.0.0.1:8000
```

Explanation:

php artisan serve starts Laravel server.

npm run dev compiles React + Vite assets.

So You can see this type Output:
---
### Index Page:

<img width="1919" height="957" alt="Screenshot 2025-12-17 180210" src="https://github.com/user-attachments/assets/b8b401a5-6131-4892-bc09-06221ac61445" />


### Create Page:

<img width="1917" height="963" alt="Screenshot 2025-12-17 180201" src="https://github.com/user-attachments/assets/4b981e7f-7476-41e6-a575-8a7fa3031bba" />

### Edit Page:

<img width="1912" height="963" alt="Screenshot 2025-12-17 180236" src="https://github.com/user-attachments/assets/c5bc1079-850e-461d-844b-49062fd816b2" />

### Delete Page:

<img width="1910" height="964" alt="Screenshot 2025-12-17 180255" src="https://github.com/user-attachments/assets/d5f145de-b063-49c7-80e8-fd13a9cfac96" />

<img width="1908" height="961" alt="Screenshot 2025-12-17 180131" src="https://github.com/user-attachments/assets/463a6445-62e2-411e-88d9-2a91c897d708" />



# Project Folder Strucure:
```

PHP_Laravel12_Select2_Implement_Using_React.JS/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── EmployeeController.php
│   ├── Models/
│   │   └── Employee.php
├── bootstrap/
│   └── app.php
├── database/
│   ├── migrations/
│   │   └── xxxx_create_employees_table.php
│   └── seeders/
├── public/
│   └── index.php
├── resources/
│   ├── js/
│   │   ├── app.jsx
│   │   ├── EmployeeCrud.jsx
│   │   └── bootstrap.js
│   └── views/
│       └── employees/
│           └── index.blade.php
├── routes/
│   └── web.php
├── .env
├── composer.json
├── package.json
├── vite.config.js
└── README.md

