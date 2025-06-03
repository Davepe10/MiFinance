import React from 'react';

const HistorialModal = ({ historial, onClose }) => {
  if (!historial.length) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow w-11/12 md:w-1/2">
          <h3 className="text-lg font-semibold mb-4">Historial de Objetivos Alcanzados</h3>
          <p>No tienes objetivos alcanzados aún.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-11/12 md:w-1/2 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Historial de Objetivos Alcanzados</h3>
        <table className="min-w-full bg-white border rounded shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border">Descripción</th>
              <th className="py-2 px-4 border">Monto</th>
              <th className="py-2 px-4 border">Fecha Alcanzado</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="py-1 px-3 border">{item.descripcion}</td>
                <td className="py-1 px-3 border">${parseFloat(item.monto).toFixed(2)}</td>
                <td className="py-1 px-3 border">{item.fecha_alcanzado}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default HistorialModal;