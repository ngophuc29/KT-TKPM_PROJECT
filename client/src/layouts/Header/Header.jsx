import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <div className="d-flex justify-content-between align-items-center bg-primary-subtle p-3">
      <div>Header</div>
      <div className="d-flex gap-3">
        <NavLink to="/login">
          <span className="text-main">Login</span>
        </NavLink>
        <NavLink to="/signup">
          <span className="text-main">Sign Up</span>
        </NavLink>
      </div>
    </div>
  );
}
