import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://mifinance.onrender.com/forgot_password', { email });
      if (res.data.status === 'success') {
        setMessage('Te hemos enviado un correo.');
        toast.success('Correo de recuperación enviado.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      toast.error('Error al enviar correo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">Recuperar Contraseña</h2>
        {message && <p className="text-green-500 mb-4">{message}</p>}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded mb-3"
        />
        <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
          Enviar enlace
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;