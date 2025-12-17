import './bootstrap'; // already present
import 'bootstrap/dist/css/bootstrap.min.css'; // ✅ Bootstrap CSS
import React from "react";
import { createRoot } from "react-dom/client";
import EmployeeCrud from "./EmployeeCrud";

const el = document.getElementById("app");
const employees = JSON.parse(el.dataset.employees);

createRoot(el).render(
    <EmployeeCrud employees={employees} />
);
