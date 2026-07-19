import React, { StrictMode , useState,useEffect } from "react";
import {BrowserRouter, Routes, Route, Link, useLocation,useNavigate} from "react-router-dom";
import { createRoot } from "react-dom/client";
import AdminHome from "./admin-home.jsx";
import {Browser, NavButtons} from "./admin-nav.jsx";
import {ReportCards} from "./temp.jsx";
import './admin.css';



const AdminPage = () => {

  useEffect(() => {
    const afterPrint = () => {
      document.body.style.visibility = "visible";
    };

    window.addEventListener("afterprint", afterPrint);

    return () => {
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);

  return (
    <BrowserRouter>
      {/* This stays visible on every page */}
      <NavButtons />

      {/* Page content changes below */}
      <div className="page-content">
        <Routes>
          <Route path="/reportcards" element={<ReportCards />} />         
        </Routes>
      </div>
    </BrowserRouter>
  );
};




const rootElement = document.getElementById("root");
console.log("rootElement:", rootElement)
const root = createRoot(rootElement);
root.render(<AdminPage />);



