import React from 'react';

const TransactionForm = ({ onSubmit, transaccion, handleChange }) => (
  <form onSubmit={onSubmit} className="max-w-md mx-auto mb-8 bg-gray-100 p-4 rounded shadow">
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
    <button
      type="submit"
      className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
      Agregar
    </button>
  </form>
);

export default TransactionForm;