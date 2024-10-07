// src/components/VersionHistory.jsx

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const VersionHistory = ({ idDocumento }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [error, setError] = useState(null); // Estado para manejar errores

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        // Verificación de idDocumento
        if (!idDocumento) {
          throw new Error('El ID del documento no está definido.');
        }

        // Realizar la solicitud para obtener el historial de versiones usando `idDocumento`
        const response = await fetch(`http://localhost:5064/api/documentos/${idDocumento}/versiones`);

        if (!response.ok) {
          throw new Error(`Error al obtener las versiones. Estado: ${response.status}`);
        }

        const data = await response.json();
        setVersions(data.versions || []); // Asegura que `versions` siempre sea un array
      } catch (error) {
        setError(error.message);
        Swal.fire({
          title: 'Error',
          text: `Error al cargar las versiones: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setLoading(false); // Finalizar la carga independientemente del resultado
      }
    };

    fetchVersions();
  }, [idDocumento]);

  if (loading) {
    return <div>Cargando historial de versiones...</div>;
  }

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Historial de Versiones</h1>
      {error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        versions.length > 0 ? (
          versions.map((version) => (
            <div key={version.idVersion} className="border-b border-gray-300 pb-2 mb-2">
              <p><strong>Comentario:</strong> {version.comentario}</p>
              <p><strong>Fecha de Modificación:</strong> {new Date(version.fechaModificacion).toLocaleDateString()}</p>
              <p><strong>Versión Final:</strong> {version.versionFinal ? 'Sí' : 'No'}</p>
              {/* Aquí puedes agregar más detalles de cada versión */}
            </div>
          ))
        ) : (
          <p>No hay versiones disponibles para este documento.</p>
        )
      )}
    </div>
  );
};

export default VersionHistory;
