import React from 'react';

const TransactionsTable = ({ transaccionesFiltradas }) => (
  <div className="overflow-x-auto max-w-4xl mx-auto mb-8">
    <table className="min-w-full bg-white border rounded shadow">
      <thead className="bg-gray-200">
        <tr>
          <th className="py-2 px-4 border">Fecha</th>
          <th className="py-2 px-4 border">Tipo</th>
          <th className="py-2 px-4 border">Categoría</th>
          <th className="py-2 px-4 border">Monto</th>
          <th className="py-2 px-4 border">Descripción</th>
        </tr>
      </thead>
      <tbody>
        {transaccionesFiltradas.length > 0 ? (
          transaccionesFiltradas.map((t, idx) => (
            <tr
              key={idx}
              className={t.tipo === 'ingreso' ? 'bg-green-50' : 'bg-red-50'}
            >
              <td className="py-1 px-3 border text-center">{t.fecha?.slice(0, 10)}</td>
              <td className="py-1 px-3 border capitalize">{t.tipo}</td>
              <td className="py-1 px-3 border">{t.categoria}</td>
              <td className="py-1 px-3 border text-right">${parseFloat(t.monto).toFixed(2)}</td>
              <td className="py-1 px-3 border">{t.descripcion}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center py-4 text-gray-500">
              No hay transacciones para este mes.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default TransactionsTable;