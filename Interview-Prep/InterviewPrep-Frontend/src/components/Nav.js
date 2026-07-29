import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { FaBars, FaTimes, FaMoon, FaSun } from "react-icons/fa";

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const isLoggedIn = localStorage.getItem("email") !== null;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Apply the theme class to <html> and persist the choice.
  // Tailwind darkMode:'class' → dark styles live under `.dark`; light is default.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

  const logout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("rating");
    localStorage.removeItem("token");
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const NavLink = ({ to, children, onClick }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`text-sm font-medium transition-all duration-300 hover:text-primary relative group ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
      >
        {children}
        <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-orange-500 transition-all duration-300 rounded-full ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
      </Link>
    );
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'glass-strong shadow-2xl shadow-black/20' : 'bg-transparent'}`}>
      {/* Gradient bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-60" />

      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 font-bold text-2xl tracking-tight group">
          <div className="size-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
            style={{ background: 'linear-gradient(135deg, hsl(24, 94%, 50%), #ea580c)' }}
          >
            <span className="font-black text-sm tracking-tighter">IP</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-foreground font-bold">Interview</span>
            <span className="text-shimmer font-extrabold tracking-wide uppercase">Prep</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/core-subject">CS Core</NavLink>
          <NavLink to="/dsa">DSA</NavLink>
          <NavLink to="/resource">Resources</NavLink>
          <NavLink to="/mock-interview/setup">Mock Interview</NavLink>
          {isLoggedIn && <NavLink to="/dashboard">Dashboard</NavLink>}
        </div>

        {/* Desktop Auth */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex items-center justify-center w-10 h-10 rounded-xl glass text-muted-foreground hover:text-primary hover:scale-110 transition-all"
          >
            {theme === "dark" ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
          </button>

          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors group">
                <BiLogOut className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-5">
                <Link to="/login" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                  Log in
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
                </Link>
                <Link to="/signup"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 glow-primary hover:glow-primary-lg hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, hsl(24, 94%, 50%), #ea580c)' }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl glass text-foreground hover:text-primary transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 glass-strong border-b border-border/50 shadow-2xl shadow-black/30 z-50">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-2">
            {[
              { to: "/core-subject", label: "CS Core Subjects" },
              { to: "/dsa", label: "DSA Roadmap" },
              { to: "/resource", label: "Resources" },
            ].map(({ to, label }) => (
              <Link key={to} to={to} onClick={closeMobileMenu} className="flex items-center px-4 py-3 rounded-xl hover:bg-white/5 text-foreground font-medium transition-colors">
                {label}
              </Link>
            ))}
            <Link to="/mock-interview/setup" onClick={closeMobileMenu} className="flex items-center px-4 py-3 rounded-xl hover:bg-primary/10 text-primary font-semibold transition-colors">
              🎯 Mock Interview
            </Link>
            {isLoggedIn && (
              <Link to="/dashboard" onClick={closeMobileMenu} className="flex items-center px-4 py-3 rounded-xl hover:bg-white/5 text-foreground font-medium transition-colors">
                📊 Dashboard
              </Link>
            )}
            <div className="border-t border-border/30 pt-4 mt-2">
              {isLoggedIn ? (
                <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors">
                  <BiLogOut className="w-5 h-5" /> Logout
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={closeMobileMenu} className="w-full text-center px-4 py-3 rounded-xl border border-border/30 text-foreground font-medium hover:bg-white/5 transition-colors">
                    Log in
                  </Link>
                  <Link to="/signup" onClick={closeMobileMenu}
                    className="w-full text-center px-4 py-3 rounded-xl text-white font-semibold shadow-lg glow-primary"
                    style={{ background: 'linear-gradient(135deg, hsl(24, 94%, 50%), #ea580c)' }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Nav;
