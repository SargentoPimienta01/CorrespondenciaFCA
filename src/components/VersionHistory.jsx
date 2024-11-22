import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

// Función para obtener el token de las cookies
const getTokenFromCookie = () => {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
  if (tokenCookie) {
    return tokenCookie.split('=')[1].trim();
  }
  return null;
};

// Función para eliminar el token
const deleteToken = () => {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

// Redirigir al login si el token no es válido
const redirectToLogin = () => {
  deleteToken();
  window.location.href = '/';
};

const VersionHistory = ({ idDocumento }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idDocumento) {
      setError('El ID del documento no está definido.');
      setLoading(false);
      return;
    }

    const fetchVersions = async () => {
      const token = getTokenFromCookie();
      if (!token) {
        Swal.fire({
          title: 'Error!',
          text: 'No se encontró el token de autenticación. Redirigiendo al login.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return redirectToLogin();
      }

      try {
        const response = await fetch(`http://32768:8080/api/versionxs`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener las versiones. Estado: ${response.status}`);
        }

        const versionsData = await response.json();
        const filteredVersions = Array.isArray(versionsData.versionxs)
          ? versionsData.versionxs.filter(version => version.idDocumento === parseInt(idDocumento, 10))
          : [];

        setVersions(filteredVersions);
      } catch (error) {
        setError(error.message);
        Swal.fire({
          title: 'Error',
          text: `Error al cargar las versiones: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [idDocumento]);

  // Función para mostrar los detalles de la versión en un SweetAlert
  const showVersionDetails = (version) => {
    Swal.fire({
      title: `Versión #${version.idVersion}`,
      html: `
        <p><strong>Comentario:</strong> ${version.comentario || 'Sin comentario'}</p>
        <p><strong>Fecha de Modificación:</strong> ${new Date(version.fechaModificacion).toLocaleString()}</p>
        <p><strong>Versión Final:</strong> ${version.versionFinal ? 'Sí' : 'No'}</p>
        <p><strong>ID del Documento:</strong> ${version.idDocumento}</p>
        <p><strong>ID de la Asignación:</strong> ${version.idAsignacion}</p>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  };

  if (loading) {
    return <div>Cargando historial de versiones...</div>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Historial de Versiones</h1>
      {versions.length > 0 ? (
        versions.map((version) => (
          <div
            key={version.idVersion}
            className="bg-gray-200 hover:bg-gray-300 transition-colors duration-200 ease-in-out rounded-lg overflow-hidden shadow-md cursor-pointer mb-2 p-4"
            onClick={() => showVersionDetails(version)}
          >
            <div className="flex justify-between">
              <span className="font-bold text-gray-800">Versión #{version.idVersion}</span>
              <span className="text-sm text-gray-500">{new Date(version.fechaModificacion).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-600">{version.comentario || 'Sin comentario'}</p>
          </div>
        ))
      ) : (
        <p>No hay versiones disponibles para este documento.</p>
      )}
    </div>
  );
};

export default VersionHistory;
