// src/components/Transactions/EditTransactionModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditTransactionModal = ({ show, handleClose, transaction, onEditTransaction }) => {
  const [editedTransaction, setEditedTransaction] = useState({
    tipo: 'ingreso',
    categoria: '',
    monto: '',
    descripcion: '',
  });

  useEffect(() => {
    if (transaction) {
      setEditedTransaction(transaction);
    }
  }, [transaction]);

  const handleChange = (e) => {
    setEditedTransaction({ ...editedTransaction, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editedTransaction.categoria.trim() || !editedTransaction.monto) {
      toast.warn('Por favor, complete categoría y monto.');
      return;
    }
    try {
      await axios.put('https://mifinance.onrender.com/edit_transaction',  {
        ...editedTransaction,
        email: transaction.email,
        fecha: transaction.fecha,
      });
      handleClose();
      onEditTransaction();
      toast.success('Transacción editada correctamente.');
    } catch (err) {
      toast.error('Error al editar transacción.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Transacción</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-2 flex justify-around">
            <label className="mr-3">
              <input
                type="radio"
                name="tipo"
                value="ingreso"
                checked={editedTransaction.tipo === 'ingreso'}
                onChange={handleChange}
              />
              Ingreso
            </label>
            <label>
              <input
                type="radio"
                name="tipo"
                value="gasto"
                checked={editedTransaction.tipo === 'gasto'}
                onChange={handleChange}
              />
              Gasto
            </label>
          </div>
          <input
            name="categoria"
            type="text"
            placeholder="Categoría"
            value={editedTransaction.categoria}
            onChange={handleChange}
            className="w-full mb-2 p-2 rounded border"
            required
          />
          <input
            name="monto"
            type="number"
            step="0.01"
            placeholder="Monto"
            value={editedTransaction.monto}
            onChange={handleChange}
            className="w-full mb-2 p-2 rounded border"
            required
          />
          <input
            name="descripcion"
            type="text"
            placeholder="Descripción (opcional)"
            value={editedTransaction.descripcion}
            onChange={handleChange}
            className="w-full mb-2 p-2 rounded border"
          />
          <Button variant="primary" type="submit">
            Guardar Cambios
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditTransactionModal;