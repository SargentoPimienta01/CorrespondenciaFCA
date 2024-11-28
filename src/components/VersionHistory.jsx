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
        const response = await fetch(`https://localhost:7105/api/Versionxs?idDocumento=${idDocumento}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener las versiones. Estado: ${response.status}`);
        }

        const data = await response.json();
        console.log('Datos recibidos de la API:', data); // Nuevo console.log para verificar los datos

        if (data.status === 200 && data.data) {
          let versionsData;
          if (Array.isArray(data.data.versionxs)) {
            versionsData = data.data.versionxs;
          } else if (data.data.version) {
            versionsData = [data.data.version];
          } else {
            throw new Error('La respuesta no contiene versiones');
          }
          setVersions(versionsData);
          console.log('Versiones procesadas:', versionsData); // Nuevo console.log para verificar las versiones procesadas
        } else {
          throw new Error('La respuesta no tiene el formato esperado');
        }
      } catch (error) {
        console.error('Error al obtener las versiones:', error); // Nuevo console.error para mostrar errores detallados
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
    // Crear botón de descarga si el documento existe
    const downloadButton = version.documento
      ? `<button id="downloadPdf" class="swal2-styled swal2-confirm" style="margin-top: 10px;">Descargar PDF</button>`
      : `<p style="color: red;">No hay documento disponible para esta versión.</p>`;

    Swal.fire({
      title: `Versión #${version.idVersion}`,
      html: `
        <p><strong>Comentario:</strong> ${version.comentario || 'Sin comentario'}</p>
        <p><strong>Fecha de Modificación:</strong> ${new Date(version.fechaModificacion).toLocaleString()}</p>
        <p><strong>Versión Final:</strong> ${version.versionFinal ? 'Sí' : 'No'}</p>
        <p><strong>ID del Documento:</strong> ${version.idDocumento}</p>
        <p><strong>ID de la Asignación:</strong> ${version.idAsignacion}</p>
        ${downloadButton}
      `,
      icon: 'info',
      showConfirmButton: false,
    });

    // Agregar funcionalidad al botón de descarga
    if (version.documento) {
      document.getElementById('downloadPdf').addEventListener('click', () => {
        // Convertir el documento base64 en un Blob
        const binary = atob(version.documento);
        const arrayBuffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          arrayBuffer[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Crear un enlace temporal para descargar el archivo
        const link = document.createElement('a');
        link.href = url;
        link.download = `Version_${version.idVersion}.pdf`;
        link.click();

        // Liberar memoria
        URL.revokeObjectURL(url);
      });
    }
  };


  if (loading) {
    return <div className="text-center p-5">Cargando historial de versiones...</div>;
  }

  if (error) {
    return <p className="text-red-500 p-5">Error: {error}</p>;
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Historial de Versiones</h1>
      {versions.length > 0 ? (
        <div className="space-y-4">
          {versions.map((version) => (
            <div
              key={version.idVersion}
              className="bg-white hover:bg-gray-50 transition-colors duration-200 ease-in-out rounded-lg overflow-hidden shadow-md cursor-pointer p-4 border border-gray-200"
              onClick={() => showVersionDetails(version)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg text-gray-800">Versión #{version.idVersion}</span>
                <span className="text-sm text-gray-500">{new Date(version.fechaModificacion).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-600 line-clamp-2">{version.comentario || 'Sin comentario'}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className={`text-sm ${version.versionFinal ? 'text-green-600' : 'text-yellow-600'}`}>
                  {version.versionFinal ? 'Versión Final' : 'Versión en Progreso'}
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center">No hay versiones disponibles para este documento.</p>
      )}
    </div>
  );
};

export default VersionHistory;

