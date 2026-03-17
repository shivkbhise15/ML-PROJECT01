import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">🚦</div>
        <div className="brand-text">
          <span className="brand-name">
            Traffic<span className="brand-accent">AI</span>
          </span>
          <span className="brand-sub">Congestion Prediction System</span>
        </div>
      </div>

      <div className="navbar-center">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Dashboard
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Analytics
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Reports
        </NavLink>
      </div>

      <div className="navbar-right">
        <div className="status-badge">
          <span className="status-dot"></span>
          Model Active
        </div>
        <div className="live-badge">LIVE</div>
      </div>
    </nav>
  );
};

export default Navbar;
