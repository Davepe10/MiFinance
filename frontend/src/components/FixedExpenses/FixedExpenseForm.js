// src/components/FixedExpenses/FixedExpenseForm.js
import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const FixedExpenseForm = ({ onAddFixedExpense }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [nuevoGastoFijo, setNuevoGastoFijo] = useState({
    categoria: '',
    monto: '',
    descripcion: '',
    mes: new Date().toISOString().slice(0, 7),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoGastoFijo({ ...nuevoGastoFijo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoGastoFijo.categoria || !nuevoGastoFijo.monto || !nuevoGastoFijo.descripcion) {
      toast.warn('Complete todos los campos del gasto fijo.');
      return;
    }
    try {
      await axios.post('https://mifinance.onrender.com/agregar_gasto_fijo',  {
        ...nuevoGastoFijo,
        email: user.email,
      });
      setNuevoGastoFijo({
        categoria: '',
        monto: '',
        descripcion: '',
        mes: new Date().toISOString().slice(0, 7),
      });
      onAddFixedExpense();
      toast.success('Gasto fijo registrado correctamente.');
    } catch (err) {
      toast.error('Error al registrar gasto fijo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 max-w-md mx-auto">
      <input
        type="text"
        placeholder="Categoría"
        value={nuevoGastoFijo.categoria}
        onChange={handleChange}
        name="categoria"
        className="w-full mb-2 p-2 rounded border"
        required
      />
      <input
        type="number"
        step="0.01"
        placeholder="Monto"
        value={nuevoGastoFijo.monto}
        onChange={handleChange}
        name="monto"
        className="w-full mb-2 p-2 rounded border"
        required
      />
      <input
        type="text"
        placeholder="Descripción"
        value={nuevoGastoFijo.descripcion}
        onChange={handleChange}
        name="descripcion"
        className="w-full mb-2 p-2 rounded border"
        required
      />
      <input
        type="month"
        value={nuevoGastoFijo.mes}
        onChange={handleChange}
        name="mes"
        className="w-full mb-4 p-2 rounded border"
        required
      />
      <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
        Agregar Gasto Fijo
      </button>
    </form>
  );
};

export default FixedExpenseForm;