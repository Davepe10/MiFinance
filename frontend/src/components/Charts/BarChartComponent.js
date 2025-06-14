// src/components/Charts/BarChartComponent.js
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const BarChartComponent = ({ data, title }) => {
  return (
    <div className="max-w-5xl mx-auto mb-8">
      <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
      )}
    </div>
  );
};

export default BarChartComponent;