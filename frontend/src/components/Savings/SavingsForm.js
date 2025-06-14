// src/components/Savings/SavingsForm.js
import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const SavingsForm = ({ onSaveSavings }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [montoAhorro, setMontoAhorro] = useState('');

  const handleChange = (e) => {
    setMontoAhorro(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!montoAhorro) {
      toast.warn('Por favor, ingrese un monto de ahorro.');
      return;
    }
    try {
      await axios.post('https://mifinance.onrender.com/agregar_ahorro',  {
        monto: montoAhorro,
        email: user.email,
      });
      setMontoAhorro('');
      onSaveSavings();
      toast.success('Monto de ahorro guardado correctamente.');
    } catch (err) {
      toast.error('Error al guardar monto de ahorro.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 max-w-md mx-auto">
      <input
        type="number"
        step="0.01"
        placeholder="Monto a Ahorrar"
        value={montoAhorro}
        onChange={handleChange}
        name="monto"
        className="w-full mb-2 p-2 rounded border"
        required
      />
      <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
        Guardar Monto de Ahorro
      </button>
    </form>
  );
};

export default SavingsForm;