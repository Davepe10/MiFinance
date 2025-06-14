// src/components/Transactions/FilterTransactions.js
import React from 'react';

const FilterTransactions = ({ filtroMes, setFiltroMes }) => {
  return (
    <div className="max-w-md mx-auto mb-6">
      <label htmlFor="filtroMes" className="font-semibold mr-3">Filtrar Mes:</label>
      <input
        type="month"
        id="filtroMes"
        value={filtroMes}
        onChange={(e) => setFiltroMes(e.target.value)}
        className="p-1 border rounded"
      />
    </div>
  );
};

export default FilterTransactions;