import React from 'react';

const TotalsSummary = ({ ingresos, gastos, balance, mostrarTotales, toggleMostrar }) => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-green-100 p-4 rounded text-center relative">
        <h4 className="text-green-800 font-semibold">Ingresos Totales</h4>
        <p className="text-xl">{mostrarTotales ? `$${ingresos.toFixed(2)}` : '•••••'}</p>
      </div>
      <div className="bg-red-100 p-4 rounded text-center relative">
        <h4 className="text-red-800 font-semibold">Gastos Totales</h4>
        <p className="text-xl">{mostrarTotales ? `$${gastos.toFixed(2)}` : '•••••'}</p>
      </div>
      <div className="bg-blue-100 p-4 rounded text-center relative">
        <h4 className="text-blue-800 font-semibold">Balance</h4>
        <p className="text-xl">{mostrarTotales ? `$${balance.toFixed(2)}` : '•••••'}</p>
      </div>
    </div>
    <button
      onClick={toggleMostrar}
      className="mb-6 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
    >
      {mostrarTotales ? 'Ocultar Totales' : 'Mostrar Totales'}
    </button>
  </>
);

export default TotalsSummary;