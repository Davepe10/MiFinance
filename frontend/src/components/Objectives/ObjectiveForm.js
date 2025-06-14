// src/components/Objectives/ObjectiveForm.js
import React, { useState,useContext  } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const ObjectiveForm = ({ onAddObjective }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [nuevoObjetivo, setNuevoObjetivo] = useState({
    monto_objtivo: '',
    monto_cuota: '',
    descripcion: '',
    fecha_finalizacion: '',
    cuotas_pagadas: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fecha_finalizacion') {
      const fechaFinalizacion = new Date(value);
      const fechaActual = new Date();
      const mesesRestantes = (fechaFinalizacion.getFullYear() - fechaActual.getFullYear()) * 12 + (fechaFinalizacion.getMonth() - fechaActual.getMonth());
      const montoCuota = parseFloat(nuevoObjetivo.monto_objtivo) / mesesRestantes;
      setNuevoObjetivo({
        ...nuevoObjetivo,
        [name]: value,
        monto_cuota: montoCuota.toFixed(2),
      });
    } else {
      setNuevoObjetivo({ ...nuevoObjetivo, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoObjetivo.descripcion || !nuevoObjetivo.monto_objtivo || !nuevoObjetivo.fecha_finalizacion) {
      toast.warn('Complete todos los campos del objetivo.');
      return;
    }
    try {
      await axios.post('https://mifinance.onrender.com/agregar_objetivo',  {
        ...nuevoObjetivo,
        email: user.email,
        alcanzado: 'no',
      });
      setNuevoObjetivo({
        monto_objtivo: '',
        monto_cuota: '',
        descripcion: '',
        fecha_finalizacion: '',
        cuotas_pagadas: 0,
      });
      onAddObjective();
      toast.success('Objetivo registrado correctamente.');
    } catch (err) {
      toast.error('Error al registrar objetivo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 max-w-md mx-auto">
      <input
        type="number"
        step="0.01"
        placeholder="Monto Objetivo"
        value={nuevoObjetivo.monto_objtivo}
        onChange={handleChange}
        name="monto_objtivo"
        className="w-full mb-2 p-2 rounded border"
        required
      />
      <input
        type="number"
        step="0.01"
        placeholder="Monto Cuota Mensual"
        value={nuevoObjetivo.monto_cuota}
        onChange={handleChange}
        name="monto_cuota"
        className="w-full mb-2 p-2 rounded border"
        readOnly
      />
      <input
        type="text"
        placeholder="Descripción"
        value={nuevoObjetivo.descripcion}
        onChange={handleChange}
        name="descripcion"
        className="w-full mb-2 p-2 rounded border"
        required
      />
      <input
        type="date"
        value={nuevoObjetivo.fecha_finalizacion}
        onChange={handleChange}
        name="fecha_finalizacion"
        className="w-full mb-4 p-2 rounded border"
        required
      />
      <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
        Agregar Objetivo
      </button>
    </form>
  );
};

export default ObjectiveForm;