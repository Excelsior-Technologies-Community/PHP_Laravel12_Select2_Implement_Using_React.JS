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
        // ✅ Validate input
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email',
            'mobile_no' => 'required|string|max:20',
            'skills' => 'required|array',
        ]);

        // ✅ Create employee
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

        // ✅ Validate input, ignore current employee's email for uniqueness
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email,' . $employee->id,
            'mobile_no' => 'required|string|max:20',
            'skills' => 'required|array',
        ]);

        // ✅ Update employee
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

        // ✅ Mark status as deleted
        $employee->update(['status' => 'deleted']);

        // ✅ Soft delete
        $employee->delete();

        return redirect()->back()->with('success', 'Employee deleted successfully!');
    }
}
