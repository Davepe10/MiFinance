// src/components/Objectives/ObjectiveCard.js
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import EditObjectiveModal from './EditObjectiveModal';

const ObjectiveCard = ({ objetivo, onPagarCuota, onEliminarObjetivo, onEditObjective }) => {
  const [showEditModal, setShowEditModal] = useState(false);

  const handlePagarCuota = async () => {
    try {
      const cuotasPagadas = parseInt(objetivo.cuotas_pagadas || 0) + 1;
      await axios.put('https://mifinance.onrender.com/marcar_cuota',  {
        email: objetivo.email,
        descripcion: objetivo.descripcion,
        cuotas_pagadas: cuotasPagadas,
      });
      onPagarCuota(objetivo.index, cuotasPagadas);
      toast.success('Cuota pagada correctamente.');
    } catch (err) {
      toast.error('Error al pagar cuota.');
    }
  };

  const handleEliminarObjetivo = async () => {
    try {
      await axios.delete('https://mifinance.onrender.com/eliminar_objetivo',  {
        data: { email: objetivo.email, descripcion: objetivo.descripcion },
      });
      onEliminarObjetivo(objetivo.index);
      toast.success('Objetivo eliminado.');
    } catch (err) {
      console.error('Error al eliminar objetivo', err);
      toast.error('No se pudo eliminar el objetivo.');
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  return (
    <div key={objetivo.index} className="mb-4 p-4 bg-white rounded shadow">
      <p><strong>Descripción:</strong> {objetivo.descripcion}</p>
      <p><strong>Monto Objetivo:</strong> ${parseFloat(objetivo.monto_objtivo).toFixed(2)}</p>
      <p><strong>Cuotas:</strong> {objetivo.cuotas_pagadas}/{objetivo.cuotas_totales}</p>
      <p><strong>Progreso:</strong> {objetivo.progreso.toFixed(2)}%</p>
      <div className="w-full bg-gray-200 h-2 rounded mt-1">
        <div
          className="bg-green-500 h-2 rounded"
          style={{ width: `${Math.min(objetivo.progreso, 100)}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2">
        <Button
          onClick={handlePagarCuota}
          variant="success"
          size="sm"
        >
          Pagar Cuota
        </Button>
        <Button
          onClick={handleEdit}
          variant="warning"
          size="sm"
        >
          Editar
        </Button>
        <Button
          onClick={handleEliminarObjetivo}
          variant="danger"
          size="sm"
        >
          Eliminar
        </Button>
      </div>
      <EditObjectiveModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        objective={objetivo}
        onEditObjective={onEditObjective}
      />
    </div>
  );
};

export default ObjectiveCard;