// src/components/FixedExpenses/EditFixedExpenseModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditFixedExpenseModal = ({ show, handleClose, gastoFijo, onEditFixedExpense }) => {
  const [editedGastoFijo, setEditedGastoFijo] = useState({
    categoria: '',
    monto: '',
    descripcion: '',
    mes: '',
  });

  useEffect(() => {
    if (gastoFijo) {
      setEditedGastoFijo(gastoFijo);
    }
  }, [gastoFijo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedGastoFijo({ ...editedGastoFijo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editedGastoFijo.categoria || !editedGastoFijo.monto || !editedGastoFijo.descripcion) {
      toast.warn('Complete todos los campos del gasto fijo.');
      return;
    }
    try {
      await axios.put('https://mifinance.onrender.com/editar_gasto_fijo',  {
        ...editedGastoFijo,
        email: gastoFijo.email,
      });
      handleClose();
      onEditFixedExpense();
      toast.success('Gasto fijo editado correctamente.');
    } catch (err) {
      toast.error('Error al editar gasto fijo.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Gasto Fijo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Categoría"
            value={editedGastoFijo.categoria}
            onChange={handleChange}
            name="categoria"
            className="w-full mb-2 p-2 rounded border"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Monto"
            value={editedGastoFijo.monto}
            onChange={handleChange}
            name="monto"
            className="w-full mb-2 p-2 rounded border"
            required
          />
          <input
            type="text"
            placeholder="Descripción"
            value={editedGastoFijo.descripcion}
            onChange={handleChange}
            name="descripcion"
            className="w-full mb-2 p-2 rounded border"
            required
          />
          <input
            type="month"
            value={editedGastoFijo.mes}
            onChange={handleChange}
            name="mes"
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

export default EditFixedExpenseModal;