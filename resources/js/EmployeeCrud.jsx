import React, { useState } from "react";
import CreatableSelect from "react-select/creatable";
import toast, { Toaster } from "react-hot-toast";
import { PencilSquare, Trash3, ArrowClockwise } from "react-bootstrap-icons";

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
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 3;

  const convertSkillsToSelect = (savedSkills) => {
    const parsed = typeof savedSkills === 'string' ? JSON.parse(savedSkills) : savedSkills;
    return parsed.map(s => ({ value: s, label: s.toUpperCase() }));
  };

  const handleAjaxAction = async (e, url, successMsg) => {
    e.preventDefault();
    if (url.includes('delete') && !window.confirm("Are you sure?")) return;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
        "Accept": "application/json",
      },
    });

    if (res.ok) {
      toast.success(successMsg);
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast.error("Something went wrong");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.target);
    skills.forEach((s) => formData.append("skills[]", s.value));

    const url = editEmployee ? `/update/${editEmployee.id}` : "/store";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
          "Accept": "application/json",
        },
        body: formData,
      });

      const data = await res.json();

      if (res.status === 422) {
        setErrors(data.errors);
        toast.error("Validation Failed");
      } else if (res.ok) {
        toast.success(editEmployee ? "Employee Updated" : "Employee Created");
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      toast.error("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  if (page === "index") {
    const filteredEmployees = employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = showDeleted ? true : emp.status === "active";
      return matchesSearch && matchesStatus;
    });

    const indexOfLast = currentPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);
    const pageNumbers = [...Array(totalPages).keys()].map((n) => n + 1);

    return (
      <div className="container my-5">
        <Toaster />
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-primary">Employee Management</h3>
          <div className="d-flex align-items-center">
            <div className="form-check form-switch me-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="deleteToggle"
                checked={showDeleted}
                onChange={() => setShowDeleted(!showDeleted)}
              />
              <label className="form-check-label fw-bold" htmlFor="deleteToggle">
                Show Deleted
              </label>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditEmployee(null);
                setSkills([]);
                setErrors({});
                setPage("form");
              }}
            >
              + Add Employee
            </button>
          </div>
        </div>

        <input
          type="text"
          className="form-control mb-3 shadow-sm"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
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
                  {currentEmployees.map((emp) => {
                    const empSkills = typeof emp.skills === 'string' ? JSON.parse(emp.skills) : emp.skills;
                    return (
                      <tr key={emp.id} className={emp.status === "deleted" ? "opacity-50" : ""}>
                        <td>{emp.id}</td>
                        <td className="fw-bold">{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.mobile_no}</td>
                        <td>
                          {empSkills.map((skill, i) => (
                            <span key={i} className="badge rounded-pill bg-info text-dark me-1">
                              {skill}
                            </span>
                          ))}
                        </td>
                        <td>
                          <span className={`badge ${emp.status === "active" ? "bg-success" : "bg-danger"}`}>
                            {emp.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-center">
                          {emp.status === "active" ? (
                            <>
                              <button
                                className="btn btn-outline-primary btn-sm me-2"
                                onClick={() => {
                                  setEditEmployee(emp);
                                  setSkills(convertSkillsToSelect(empSkills));
                                  setErrors({});
                                  setPage("form");
                                }}
                              >
                                <PencilSquare />
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={(e) => handleAjaxAction(e, `/delete/${emp.id}`, "Employee Deleted")}
                              >
                                <Trash3 />
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={(e) => handleAjaxAction(e, `/restore/${emp.id}`, "Employee Restored")}
                            >
                              <ArrowClockwise className="me-1" /> Restore
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center p-3 bg-light">
              <button
                className="btn btn-sm btn-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Prev
              </button>
              <ul className="pagination pagination-sm mb-0">
                {pageNumbers.map((num) => (
                  <li key={num} className={`page-item ${currentPage === num ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(num)}>
                      {num}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className="btn btn-sm btn-secondary"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <Toaster />
      <div className="card shadow border-0 mx-auto" style={{ maxWidth: "600px" }}>
        <div className="card-header bg-primary text-white text-center py-3">
          <h4 className="mb-0">{editEmployee ? "Edit Employee" : "Create New Employee"}</h4>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Full Name</label>
              <input
                type="text"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                name="name"
                defaultValue={editEmployee?.name || ""}
                placeholder="Enter full name"
              />
              {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Email Address</label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                name="email"
                defaultValue={editEmployee?.email || ""}
                placeholder="name@example.com"
              />
              {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Mobile Number</label>
              <input
                type="text"
                className={`form-control ${errors.mobile_no ? "is-invalid" : ""}`}
                name="mobile_no"
                defaultValue={editEmployee?.mobile_no || ""}
                placeholder="Ex: +91 9876543210"
              />
              {errors.mobile_no && <div className="invalid-feedback">{errors.mobile_no[0]}</div>}
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold">Skills (Type to add new)</label>
                <CreatableSelect
                    isMulti
                    options={skillOptions}
                    value={skills}
                    onChange={setSkills}
                    className={errors.skills ? "is-invalid" : ""}
                />
                {errors.skills && <div className="text-danger small mt-1">{errors.skills[0]}</div>}
            </div>

            <div className="d-flex justify-content-between mt-5">
              <button type="button" className="btn btn-light border px-4" onClick={() => setPage("index")}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-5 shadow-sm" disabled={loading}>
                {loading ? "Saving..." : editEmployee ? "Update Employee" : "Save Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}