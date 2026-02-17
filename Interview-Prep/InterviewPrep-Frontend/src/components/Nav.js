import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BiUser, BiLogOut } from "react-icons/bi";

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear("email");
    localStorage.clear("rating");
    navigate("/");
  };

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors hover:text-primary relative group ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
      >
        {children}
        <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
      </Link>
    )
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      {/* Impressive Gradient Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-80 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-3 font-bold text-2xl tracking-tight group">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
              <span className="font-bold text-base tracking-tighter">IP</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-foreground">Interview</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 font-extrabold tracking-wide uppercase">Prep</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/core-subject">CS Core</NavLink>
          <NavLink to="/generate-list-parameter">DSA</NavLink>
          <NavLink to="/resouce">Resources</NavLink>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {localStorage.getItem("email") !== null ? (
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
            >
              <BiLogOut className="w-5 h-5" />
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                Log in
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Nav;
