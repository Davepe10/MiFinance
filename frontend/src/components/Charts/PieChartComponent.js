// src/components/Charts/PieChartComponent.js
import React from 'react';
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#4ade80', '#f87171'];

const PieChartComponent = ({ data, title }) => {
  return (
    <div className="max-w-5xl mx-auto mb-8">
      <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-500">No hay datos para mostrar.</p>
      )}
    </div>
  );
};

export default PieChartComponent;