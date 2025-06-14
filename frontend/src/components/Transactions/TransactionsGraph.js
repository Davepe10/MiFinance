// src/components/Transactions/TransactionsGraph.js
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const TransactionsGraph = ({ datosBarras }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="max-w-5xl mx-auto mb-8">
      <h3 className="text-xl font-semibold mb-4 text-center">Resumen por Categoría</h3>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-4 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
      >
        {isVisible ? 'Ocultar Gráfico' : 'Mostrar Gráfico'}
      </button>
      {isVisible && (
        datosBarras.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosBarras} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="categoria" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingreso" fill="#4ade80" name="Ingresos" />
              <Bar dataKey="gasto" fill="#f87171" name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">No hay datos para mostrar.</p>
        )
      )}
    </div>
  );
};

export default TransactionsGraph;