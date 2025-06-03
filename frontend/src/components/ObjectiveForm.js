import React from 'react';

const ObjectiveForm = ({ onSubmit, nuevoObjetivo, handleChange, btnText = "Agregar Objetivo" }) => (
  <form onSubmit={onSubmit} className="mt-4">
    <input
      type="text"
      placeholder="Descripción"
      value={nuevoObjetivo.descripcion}
      onChange={handleChange('descripcion')}
      className="w-full mb-2 p-2 rounded border"
      required
    />
    <input
      type="number"
      step="0.01"
      placeholder="Monto objetivo"
      value={nuevoObjetivo.monto}
      onChange={handleChange('monto')}
      className="w-full mb-2 p-2 rounded border"
      required
    />
    <input
      type="date"
      value={nuevoObjetivo.fechaFinalizacion}
      onChange={handleChange('fechaFinalizacion')}
      className="w-full mb-4 p-2 rounded border"
      required
    />
    <button
      type="submit"
      className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
    >
      {btnText}
    </button>
  </form>
);

export default ObjectiveForm;