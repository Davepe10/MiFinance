import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow text-center">
        <h2 className="text-xl font-bold mb-4">Acceso Denegado</h2>
        <p className="mb-4">Debes iniciar sesión para ver esta página.</p>
        <Link to="/home" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;