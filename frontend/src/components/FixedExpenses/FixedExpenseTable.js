// src/components/FixedExpenses/FixedExpenseTable.js
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import EditFixedExpenseModal from './EditFixedExpenseModal';

const FixedExpenseTable = ({ gastosFijos, onEditFixedExpense, onDeleteFixedExpense }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [gastoFijoToEdit, setGastoFijoToEdit] = useState(null);

  const handleEdit = (gastoFijo) => {
    setGastoFijoToEdit(gastoFijo);
    setShowEditModal(true);
  };

  return (
    <div className="max-w-lg mx-auto mb-8">
      <h3 className="text-lg font-semibold mb-3">Lista de Gastos Fijos</h3>
      {gastosFijos.length > 0 ? (
        <table className="min-w-full bg-white border rounded shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-3 border">Categoría</th>
              <th className="py-2 px-3 border">Monto</th>
              <th className="py-2 px-3 border">Descripción</th>
              <th className="py-2 px-3 border">Mes</th>
              <th className="py-2 px-3 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastosFijos.map((gf, idx) => (
              <tr key={idx} className="hover:bg-gray-100">
                <td className="py-1 px-3 border">{gf.categoria}</td>
                <td className="py-1 px-3 border">${parseFloat(gf.monto).toFixed(2)}</td>
                <td className="py-1 px-3 border">{gf.descripcion}</td>
                <td className="py-1 px-3 border">{gf.mes}</td>
                <td className="py-1 px-3 border">
                  <Button
                    onClick={() => handleEdit(gf)}
                    variant="warning"
                    size="sm"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => onDeleteFixedExpense(gf.index)}
                    variant="danger"
                    size="sm"
                    className="ml-2"
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-gray-500">No hay gastos fijos registrados.</p>
      )}
      <EditFixedExpenseModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        gastoFijo={gastoFijoToEdit}
        onEditFixedExpense={onEditFixedExpense}
      />
    </div>
  );
};

export default FixedExpenseTable;