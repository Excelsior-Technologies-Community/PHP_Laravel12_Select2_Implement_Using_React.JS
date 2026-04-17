import React, { useState } from "react";
import Select from "react-select";
import { PencilSquare, Trash3 } from "react-bootstrap-icons";

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

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 3;

  const convertSkillsToSelect = (savedSkills) => {
    return skillOptions.filter((opt) => savedSkills.includes(opt.value));
  };

  /* ================= INDEX PAGE ================= */
  if (page === "index") {
    const filteredEmployees = employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase())
    );

    const indexOfLast = currentPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentEmployees = filteredEmployees.slice(
      indexOfFirst,
      indexOfLast
    );

    const totalPages = Math.ceil(
      filteredEmployees.length / recordsPerPage
    );

    const pageNumbers = [...Array(totalPages).keys()].map((n) => n + 1);

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

        {/* SEARCH */}
        <input
          type="text"
          className="form-control mb-3"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

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
                  {currentEmployees.map((emp) => {
                    const empSkills = JSON.parse(emp.skills);

                    return (
                      <tr key={emp.id}>
                        <td>{emp.id}</td>
                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.mobile_no}</td>

                        <td>
                          {empSkills.map((skill, i) => (
                            <span key={i} className="badge bg-primary me-1">
                              {skill}
                            </span>
                          ))}
                        </td>

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
                                  setSkills(
                                    convertSkillsToSelect(empSkills)
                                  );
                                  setPage("form");
                                }}
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
                                  value={
                                    document.querySelector(
                                      'meta[name="csrf-token"]'
                                    ).content
                                  }
                                />
                                <button className="btn btn-outline-danger btn-sm">
                                  <Trash3 />
                                </button>
                              </form>
                            </>
                          )}

                          {emp.status === "deleted" && (
                            <form
                              method="POST"
                              action={`/restore/${emp.id}`}
                              style={{ display: "inline" }}
                            >
                              <input
                                type="hidden"
                                name="_token"
                                value={
                                  document.querySelector(
                                    'meta[name="csrf-token"]'
                                  ).content
                                }
                              />
                              <button className="btn btn-warning btn-sm">
                                Restore
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="d-flex justify-content-between align-items-center p-3">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ⬅ Prev
              </button>

              <ul className="pagination mb-0">
                {pageNumbers.map((num) => (
                  <li
                    key={num}
                    className={`page-item ${
                      currentPage === num ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(num)}
                    >
                      {num}
                    </button>
                  </li>
                ))}
              </ul>

              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next ➡
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= FORM PAGE ================= */
  return (
    <div className="container my-5">
      <div className="card shadow mx-auto" style={{ maxWidth: "600px" }}>
        <div className="card-header bg-primary text-white text-center">
          <h4>{editEmployee ? "Edit Employee" : "Create Employee"}</h4>
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
              <label className="form-label fw-bold">Full Name</label>
              <input
                type="text"
                className="form-control mb-3"
                name="name"
                placeholder="Full Name"
                defaultValue={editEmployee?.name || ""}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control mb-3"
                name="email"
                placeholder="Email"
                defaultValue={editEmployee?.email || ""}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Mobile</label>
              <input
                type="text"
                className="form-control mb-3"
                name="mobile_no"
                placeholder="Mobile"
                defaultValue={editEmployee?.mobile_no || ""}
                required
              />
            </div>

            <div className="mb-3">
              <label className="fw-bold">Skills</label>
              <Select
                isMulti
                options={skillOptions}
                value={skills}
                onChange={setSkills}
              />
            </div>

            {skills.map((s, i) => (
              <input key={i} type="hidden" name="skills[]" value={s.value} />
            ))}

            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-success">
                {editEmployee ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
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