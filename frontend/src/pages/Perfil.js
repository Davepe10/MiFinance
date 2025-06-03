import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';

const Perfil = () => {
  const { user } = useContext(UserContext);

  if (!user) return null;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Perfil del Usuario</h2>
      <div className="bg-white p-4 rounded shadow border">
        <p><strong>Nombre:</strong> {user.nombre}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Último acceso:</strong> {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default Perfil;