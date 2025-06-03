import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const BarChartComponent = ({ datosGrafico }) => {
  if (!datosGrafico.length) return null;

  return (
    <div className="max-w-5xl mx-auto mb-8">
      <h3 className="text-xl font-semibold mb-4 text-center">Resumen por Categoría</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={datosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="categoria" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="ingreso" fill="#4ade80" name="Ingresos" />
          <Bar dataKey="gasto" fill="#f87171" name="Gastos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;