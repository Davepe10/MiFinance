import React, { useState, useContext } from 'react'; // Aquí se corrige: useContext viene de 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext'; // Importamos el contexto correctamente
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(UserContext); // Usamos el contexto correctamente

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', { email, password });
      if (res.data.status === 'success') {
        login(res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Correo o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">Iniciar Sesión</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded mb-3"
        />
        <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
          Ingresar
        </button>
        <div className="mt-4 text-center">
          <Link to="/register" className="text-blue-600 hover:underline">¿No tienes cuenta? Regístrate</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;