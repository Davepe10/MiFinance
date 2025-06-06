import React, { useState } from 'react';
import axios from 'axios';

const FixedExpenseForm = ({ email, fetchFixedExpenses }) => {
  const [expense, setExpense] = useState({
    categoria: '',
    monto: '',
    descripcion: '',
    mes: ''
  });

  const handleChange = (e) => {
    setExpense({ ...expense, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!expense.categoria || !expense.monto || !expense.descripcion) {
      alert('Complete todos los campos.');
      return;
    }
    try {
      await axios.post('https://mifinance.onrender.com/gastos_fijos', {
        ...expense,
        email
      });
      setExpense({ categoria: '', monto: '', descripcion: '', mes: '' });
      fetchFixedExpenses();
    } catch (err) {
      console.error(err);
      alert('Error al guardar gasto fijo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8 bg-gray-100 p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Agregar Gasto Fijo Mensual</h3>
      <input
        name="categoria"
        type="text"
        placeholder="Categoría"
        value={expense.categoria}
        onChange={handleChange}
        className="w-full mb-2 p-2 rounded border"
        required
      />
      <input
        name="monto"
        type="number"
        step="0.01"
        placeholder="Monto"
        value={expense.monto}
        onChange={handleChange}
        className="w-full mb-2 p-2 rounded border"
        required
      />
      <input
        name="descripcion"
        type="text"
        placeholder="Descripción"
        value={expense.descripcion}
        onChange={handleChange}
        className="w-full mb-2 p-2 rounded border"
        required
      />
      <input
        name="mes"
        type="month"
        value={expense.mes}
        onChange={handleChange}
        className="w-full mb-4 p-2 rounded border"
        required
      />
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Agregar Gasto Fijo
      </button>
    </form>
  );
};

export default FixedExpenseForm;