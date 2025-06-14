// src/components/Objectives/ObjectivesHistory.js
import React from 'react';

const ObjectivesHistory = ({ historial }) => {
  return (
    <div className="max-w-lg mx-auto mb-8 bg-gray-100 p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Historial de Objetivos Completados</h3>
      {historial.length > 0 ? (
        historial.map((obj, idx) => (
          <div key={idx} className="mb-4 p-4 bg-white rounded shadow">
            <p><strong>Descripción:</strong> {obj.descripcion}</p>
            <p><strong>Monto Objetivo:</strong> ${parseFloat(obj.monto_objtivo).toFixed(2)}</p>
            <p><strong>Cuotas:</strong> {obj.cuotas_pagadas}/{obj.cuotas_totales}</p>
            <p><strong>Progreso:</strong> {obj.progreso.toFixed(2)}%</p>
            <div className="w-full bg-gray-200 h-2 rounded mt-1">
              <div
                className="bg-green-500 h-2 rounded"
                style={{ width: `${Math.min(obj.progreso, 100)}%` }}
              ></div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No hay objetivos completados.</p>
      )}
    </div>
  );
};

export default ObjectivesHistory;