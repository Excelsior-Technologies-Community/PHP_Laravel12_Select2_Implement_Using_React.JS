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
