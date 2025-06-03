import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Link } from 'react-router-dom';

const Configuracion = () => {
  const { user } = useContext(UserContext);

  if (!user) return null;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Configuración</h2>
      <div className="bg-white p-4 rounded shadow border">
        <p>Aquí puedes cambiar tus preferencias de cuenta.</p>
        <ul className="mt-4 space-y-2">
          <li className="hover:underline"><Link to="/perfil">Ver perfil</Link></li>
          <li className="hover:underline"><Link to="/login">Cerrar sesión</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Configuracion;