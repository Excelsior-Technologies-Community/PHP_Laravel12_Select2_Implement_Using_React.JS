<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index()
    {
        //  show all including deleted
        $employees = Employee::withTrashed()->get();

        return view('employees.index', compact('employees'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email',
            'mobile_no' => 'required|string|max:20',
            'skills' => 'required|array',
        ]);

        Employee::create([
            'name' => $request->name,
            'email' => $request->email,
            'mobile_no' => $request->mobile_no,
            'skills' => json_encode($request->skills),
            'status' => 'active',
        ]);

        return back()->with('success', 'Employee created!');
    }

    public function update(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email,' . $employee->id,
            'mobile_no' => 'required|string|max:20',
            'skills' => 'required|array',
        ]);

        $employee->update([
            'name' => $request->name,
            'email' => $request->email,
            'mobile_no' => $request->mobile_no,
            'skills' => json_encode($request->skills),
        ]);

        return back()->with('success', 'Employee updated!');
    }

    public function destroy($id)
    {
        $employee = Employee::findOrFail($id);

        $employee->update(['status' => 'deleted']);
        $employee->delete();

        return back()->with('success', 'Employee deleted!');
    }

    //  NEW RESTORE FUNCTION
    public function restore($id)
    {
        $employee = Employee::withTrashed()->findOrFail($id);

        $employee->update(['status' => 'active']);
        $employee->restore();

        return back()->with('success', 'Employee restored!');
    }
}