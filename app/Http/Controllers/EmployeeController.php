<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::withTrashed()->orderBy('id', 'desc')->get();

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

        $employee = Employee::create([
            'name' => $request->name,
            'email' => $request->email,
            'mobile_no' => $request->mobile_no,
            'skills' => json_encode($request->skills),
            'status' => 'active',
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Employee created successfully!',
                'employee' => $employee
            ]);
        }

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

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Employee updated successfully!'
            ]);
        }

        return back()->with('success', 'Employee updated!');
    }

    public function destroy($id)
    {
        $employee = Employee::findOrFail($id);

        $employee->update(['status' => 'deleted']);
        $employee->delete();

        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Employee deleted successfully!'
            ]);
        }

        return back()->with('success', 'Employee deleted!');
    }

    public function restore($id)
    {
        $employee = Employee::withTrashed()->findOrFail($id);

        $employee->update(['status' => 'active']);
        $employee->restore();

        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Employee restored successfully!'
            ]);
        }

        return back()->with('success', 'Employee restored!');
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);
        
        Employee::whereIn('id', $ids)->update(['status' => 'deleted']);
        Employee::whereIn('id', $ids)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Selected employees deleted successfully!'
        ]);
    }
}