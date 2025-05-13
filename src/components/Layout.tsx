
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, ListChecks, Clock } from "lucide-react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="header-control">
        <h1>CONTROLE DE ABSENTEÍSMO</h1>
      </header>

      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex flex-wrap justify-center gap-4 md:gap-8">
          <NavLink to="/" active={isActive("/")}>
            <ListChecks className="mr-2" />
            Registrar Presenças
          </NavLink>
          <NavLink to="/breaks" active={isActive("/breaks")}>
            <Clock className="mr-2" />
            Horários de Pausa
          </NavLink>
          <NavLink to="/dashboard" active={isActive("/dashboard")}>
            <Calendar className="mr-2" />
            Dashboard
          </NavLink>
        </div>
      </nav>

      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>

      <footer className="bg-gray-800 text-white p-4 text-center">
        <div className="container mx-auto">
          <p>Sistema de Controle de Absenteísmo © 2025</p>
        </div>
      </footer>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => {
  return (
    <Link
      to={to}
      className={`inline-flex items-center px-4 py-2 rounded-md transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "hover:bg-blue-700 text-gray-200"
      }`}
    >
      {children}
    </Link>
  );
};

export default Layout;
