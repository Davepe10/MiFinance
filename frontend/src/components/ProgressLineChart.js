import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ProgressLineChart = ({ objetivos }) => {
  const datos = objetivos.map(obj => ({
    name: obj.descripcion.slice(0, 10),
    Meta: parseFloat(obj.monto_objtivo || obj.monto),
    Ahorrado: parseFloat(obj.acumulado || 0)
  }));

  if (!datos.length) return null;

  return (
    <div className="max-w-lg mx-auto mb-8">
      <h3 className="text-xl font-semibold mb-4 text-center">Progreso de Objetivos</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={datos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Meta" stroke="#6366f1" strokeWidth={2} />
          <Line type="monotone" dataKey="Ahorrado" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressLineChart;