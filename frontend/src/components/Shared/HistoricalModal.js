// src/components/Shared/HistoricalModal.js
import React from 'react';
import { Modal } from 'react-bootstrap';

const HistoricalModal = ({ show, handleClose, historicalData, title }) => {
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-3 border">Descripción</th>
                <th className="py-2 px-3 border">Monto Objetivo</th>
                <th className="py-2 px-3 border">Cuotas Pagadas</th>
                <th className="py-2 px-3 border">Cuotas Totales</th>
                <th className="py-2 px-3 border">Progreso</th>
              </tr>
            </thead>
            <tbody>
              {historicalData.map((data, idx) => (
                <tr key={idx} className="hover:bg-gray-100">
                  <td className="py-1 px-3 border">{data.descripcion}</td>
                  <td className="py-1 px-3 border">${parseFloat(data.monto_objtivo).toFixed(2)}</td>
                  <td className="py-1 px-3 border">{data.cuotas_pagadas}</td>
                  <td className="py-1 px-3 border">{data.cuotas_totales}</td>
                  <td className="py-1 px-3 border">{data.progreso.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default HistoricalModal;