// src/components/Layout/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="hidden md:block w-64 bg-gray-100 h-screen fixed top-0 left-0 overflow-y-auto">
      <div className="p-4">
        <Link to="/dashboard" className="text-xl font-bold text-indigo-600 hover:text-indigo-800 transition block mb-4">
          FinanzApp
        </Link>
        <ul className="space-y-2">
          <li>
            <Link to="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-200 transition">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/perfil" className="block px-4 py-2 rounded hover:bg-gray-200 transition">
              Perfil
            </Link>
          </li>
          <li>
            <Link to="/configuracion" className="block px-4 py-2 rounded hover:bg-gray-200 transition">
              Configuración
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;