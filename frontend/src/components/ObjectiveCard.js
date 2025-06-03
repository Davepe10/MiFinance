import React from 'react';
import { toast } from 'react-toastify';

const ObjectiveCard = ({ obj, onEdit, onDelete }) => {
  const meta = parseFloat(obj.monto) || 0;
  const cuotaMensual = parseFloat(obj.monto_cuota) || 0;
  const acumulado = obj.acumulado || 0;
  const progreso = meta ? Math.min((acumulado / meta) * 100, 100) : 0;

  // Mostrar notificación cuando se alcanza un objetivo
  React.useEffect(() => {
    if (progreso >= 100 && obj.alcanzado !== 'si') {
      toast.info(`🎉 ¡Alcanzaste tu objetivo "${obj.descripcion}"!`);
    }
  }, [progreso, obj]);

  return (
    <div className="bg-white rounded p-3 mb-3 border flex justify-between items-center">
      <div>
        <p><strong>Descripción:</strong> {obj.descripcion}</p>
        <p><strong>Monto:</strong> ${meta.toFixed(2)}</p>
        <p><strong>Cuota mensual:</strong> ${cuotaMensual.toFixed(2)}</p>
        <p><strong>Progreso:</strong> {progreso.toFixed(2)}%</p>
        <div className="w-full bg-gray-200 h-2 rounded mt-1">
          <div className="bg-green-500 h-2 rounded" style={{ width: `${progreso}%` }}></div>
        </div>
      </div>
      <div>
        <button
          onClick={() => onEdit(obj)}
          className="mr-2 text-blue-600 hover:underline"
          title="Editar"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(obj)}
          className="text-red-600 hover:underline"
          title="Eliminar"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default ObjectiveCard;