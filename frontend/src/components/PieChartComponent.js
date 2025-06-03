import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#f87171', '#fbbf24', '#3b82f6', '#10b981', '#8b5cf6'];

const PieChartComponent = ({ datosPastel }) => {
  if (!datosPastel.length) return null;

  return (
    <div className="max-w-lg mx-auto mb-8">
      <h3 className="text-xl font-semibold mb-4 text-center">Distribución de Gastos</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={datosPastel}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {datosPastel.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;