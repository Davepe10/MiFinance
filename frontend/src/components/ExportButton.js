import React from 'react';

const ExportButton = ({ data, filename = "datos.csv", label = "Exportar CSV" }) => {
  const exportToCSV = () => {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));
    for (const row of data) {
      csvRows.push(headers.map(h => row[h]).join(','));
    }
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <button
      onClick={exportToCSV}
      className="py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
    >
      {label}
    </button>
  );
};

export default ExportButton;

