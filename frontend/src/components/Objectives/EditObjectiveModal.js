// src/components/Objectives/EditObjectiveModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditObjectiveModal = ({ show, handleClose, objective, onEditObjective }) => {
  const [editedObjective, setEditedObjective] = useState({
    monto_objtivo: '',
    monto_cuota: '',
    descripcion: '',
    fecha_finalizacion: '',
    cuotas_pagadas: 0,
  });

  useEffect(() => {
    if (objective) {
      setEditedObjective(objective);
    }
  }, [objective]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fecha_finalizacion') {
      const fechaFinalizacion = new Date(value);
      const fechaActual = new Date();
      const mesesRestantes = (fechaFinalizacion.getFullYear() - fechaActual.getFullYear()) * 12 + (fechaFinalizacion.getMonth() - fechaActual.getMonth());
      const montoCuota = parseFloat(editedObjective.monto_objtivo) / mesesRestantes;
      setEditedObjective({
        ...editedObjective,
        [name]: value,
        monto_cuota: montoCuota.toFixed(2),
      });
    } else {
      setEditedObjective({ ...editedObjective, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editedObjective.descripcion || !editedObjective.monto_objtivo || !editedObjective.fecha_finalizacion) {
      toast.warn('Complete todos los campos del objetivo.');
      return;
    }
    try {
      await axios.put('https://mifinance.onrender.com/editar_objetivo',  {
        ...editedObjective,
        email: objective.email,
      });
      handleClose();
      onEditObjective();
      toast.success('Objetivo editado correctamente.');
    } catch (err) {
      toast.error('Error al editar objetivo.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Objetivo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            step="0.01"
            placeholder="Monto Objetivo"
            value={editedObjective.monto_objtivo}
            onChange={handleChange}
            name="monto_objtivo"
            className="w-full mb-2 p-2 rounded border"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Monto Cuota Mensual"
            value={editedObjective.monto_cuota}
            onChange={handleChange}
            name="monto_cuota"
            className="w-full mb-2 p-2 rounded border"
            readOnly
          />
          <input
            type="text"
            placeholder="Descripción"
            value={editedObjective.descripcion}
            onChange={handleChange}
            name="descripcion"
            className="w-full mb-2 p-2 rounded border"
            required
          />
          <input
            type="date"
            value={editedObjective.fecha_finalizacion}
            onChange={handleChange}
            name="fecha_finalizacion"
            className="w-full mb-4 p-2 rounded border"
            required
          />
          <Button variant="primary" type="submit">
            Guardar Cambios
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditObjectiveModal;