// src/components/Shared/TotalSummary.js
import React from 'react';

const TotalSummary = ({ ingresos, gastos, balance }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-green-100 p-4 rounded text-center relative">
        <h4 className="text-green-800 font-semibold">Ingresos Totales</h4>
        <p className="text-xl">${parseFloat(ingresos).toFixed(2)}</p>
      </div>
      <div className="bg-red-100 p-4 rounded text-center relative">
        <h4 className="text-red-800 font-semibold">Gastos Totales</h4>
        <p className="text-xl">${parseFloat(gastos).toFixed(2)}</p>
      </div>
      <div className="bg-blue-100 p-4 rounded text-center relative">
        <h4 className="text-blue-800 font-semibold">Balance</h4>
        <p className="text-xl">${parseFloat(balance).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default TotalSummary;