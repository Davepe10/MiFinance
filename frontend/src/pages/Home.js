import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6">
          Control Financiero Personal
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          La aplicación para gestionar tus finanzas fácilmente
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition text-center"
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-lg shadow hover:bg-indigo-50 transition text-center"
          >
            Registrarse
          </Link>
        </div>
      </div>

      <footer className="mt-12 text-sm text-gray-500">
        <p>© 2025 TuAppFinanciera. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Home;