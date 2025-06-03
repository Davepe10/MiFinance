import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <h1 className="text-5xl font-bold text-red-600">404</h1>
    <p className="text-xl mt-4">Página no encontrada</p>
    <Link to="/dashboard" className="mt-4 text-blue-600 underline">Volver al inicio</Link>
  </div>
);

export default ErrorPage;