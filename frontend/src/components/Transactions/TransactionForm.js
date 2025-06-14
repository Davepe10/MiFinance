// src/components/Transactions/TransactionForm.js
import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const TransactionForm = ({ onAddTransaction }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [transaccion, setTransaccion] = useState({ tipo: 'ingreso', categoria: '', monto: '', descripcion: '' });

  const handleChange = (e) => {
    setTransaccion({ ...transaccion, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transaccion.categoria.trim() || !transaccion.monto) {
      toast.warn('Por favor, complete categoría y monto.');
      return;
    }
    try {
      await axios.post('https://mifinance.onrender.com/add_transaction',  {
        ...transaccion,
        email: user.email,
        fecha: new Date().toISOString(),
      });
      setTransaccion({ tipo: 'ingreso', categoria: '', monto: '', descripcion: '' });
      onAddTransaction();
      toast.success('Transacción registrada correctamente.');
    } catch (err) {
      toast.error('Error al registrar transacción.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8 bg-gray-100 p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Agregar nueva transacción</h3>
      <div className="mb-2 flex justify-around">
        <label className="mr-3">
          <input
            type="radio"
            name="tipo"
            value="ingreso"
            checked={transaccion.tipo === 'ingreso'}
            onChange={handleChange}
          />
          Ingreso
        </label>
        <label>
          <input
            type="radio"
            name="tipo"
            value="gasto"
            checked={transaccion.tipo === 'gasto'}
            onChange={handleChange}
          />
          Gasto
        </label>
      </div>
      <input
        name="categoria"
        type="text"
        placeholder="Categoría"
        value={transaccion.categoria}
        onChange={handleChange}
        className="w-full mb-2 p-2 rounded border"
        required
      />
      <input
        name="monto"
        type="number"
        step="0.01"
        placeholder="Monto"
        value={transaccion.monto}
        onChange={handleChange}
        className="w-full mb-2 p-2 rounded border"
        required
      />
      <input
        name="descripcion"
        type="text"
        placeholder="Descripción (opcional)"
        value={transaccion.descripcion}
        onChange={handleChange}
        className="w-full mb-2 p-2 rounded border"
      />
      <button type="submit" className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
        Agregar
      </button>
    </form>
  );
};

export default TransactionForm;