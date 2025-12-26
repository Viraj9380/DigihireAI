//digihire-frontend/src/components/Navbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/app.css";
import logo from "../assets/digihire-logo.png"; // ✅ Correct logo import

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname.startsWith(path) ? "nav-active" : "";

  return (
    <nav className="navbar-container">
      <div className="navbar-left">
        <img src={logo} alt="DigiHireAI Logo" className="navbar-logo" />
        <span className="navbar-title">DigiHireAI</span>
      </div>

      <div className="navbar-links">
        <Link to="/assessments" className={`nav-link ${isActive("/assessments")}`}>
          Assessments
        </Link>

        <Link to="/candidates" className={`nav-link ${isActive("/candidates")}`}>
          Candidates
        </Link>

        <Link to="/vendor" className={`nav-link ${isActive("/vendor")}`}>
          Vendors
        </Link>

        <Link to="/tests" className={`nav-link ${isActive("/tests")}`}>
          Test Creation
        </Link>

        

      </div>

      <div className="navbar-right">
        <div className="navbar-user-circle">T</div>
      </div>
    </nav>
  );
};

export default Navbar;
