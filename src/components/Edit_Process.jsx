import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// Función para obtener el token desde las cookies
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

// Redirigir al login si el token es inválido o no está presente
const redirectToLogin = () => {
  deleteToken(); // Eliminar cualquier token existente
  window.location.href = '/'; // Redirigir al login
};

// Función para formatear las fechas en el formato esperado por la API
const formatDateForAPI = (date) => {
  return new Date(date).toISOString().slice(0, 19);  // Eliminar la 'Z' del final
};

const EditProcessForm = ({ idProceso }) => {
  const [formData, setFormData] = useState({
    idProceso,
    fechaInicio: '',
    fechaActualizacion: '',
    fechaNotificacion: '',
    descripcion: '',
    infoArchivo: '',
    // procesosDocumentos: null,
    });  
  
  // Inicializamos con null para no renderizar hasta que haya datos
  const [loading, setLoading] = useState(true);

  // Cargar los datos del proceso
  useEffect(() => {
    const fetchData = async () => {
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
        // Obtener los datos del proceso
        console.log(idProceso);
        const response = await fetch(`http://localhost:5064/api/procesos/${idProceso}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener los datos del proceso');
        }

        const result = await response.json();
        const processData = result.data.proceso;  // Asegúrate de que la clave correcta es `proceso`

        console.log("Data fetched from API:", processData);

        // Verifica que las propiedades existan antes de intentar acceder a ellas
        if (processData) {
          setFormData({
            fechaInicio: processData.fechaInicio ? processData.fechaInicio.split('T')[0] : '', // Fecha formateada
            fechaActualizacion: processData.fechaActualizacion ? processData.fechaActualizacion.split('T')[0] : '',  // Fecha formateada
            fechaNotificacion: processData.fechaNotificacion ? processData.fechaNotificacion.split('T')[0] : '',  // Fecha formateada
            descripcion: processData.descripcion || '',
            infoArchivo: processData.infoArchivo || '',
            // procesosDocumentos: processData.procesosDocumentos || [],  // Array de documentos relacionados
          });
        } else {
          throw new Error('El objeto proceso está vacío o malformado');
        }

        setLoading(false); // Terminar la carga
      } catch (error) {
        console.error('Error al obtener los datos del proceso:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [idProceso]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevenir la recarga de la página

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

    const formattedData = {
      ...formData,
      fechaInicio: formatDateForAPI(formData.fechaInicio),
      fechaActualizacion: formatDateForAPI(formData.fechaActualizacion),
      fechaNotificacion: formatDateForAPI(formData.fechaNotificacion),
    };

    console.log("Datos enviados al servidor:", formattedData);

    try {
      const response = await fetch(`http://localhost:5064/api/procesos/${idProceso}`, {
        method: 'PUT', // Método PUT para actualizar
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorDetails = await response.json(); // Obtener detalles del error
        console.error('Detalles del error:', errorDetails);
        throw new Error('Error al actualizar el proceso');
      }

      Swal.fire({
        title: 'Proceso actualizado!',
        text: 'El proceso se ha actualizado exitosamente.',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      console.error('Error en la actualización:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Ocurrió un error al actualizar el proceso.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  if (loading || !formData) {
    return <div>Cargando datos del proceso...</div>;  // Mostrar mensaje de carga si no hay datos
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
        <div className="flex flex-col space-y-4">
          {/* Información del archivo */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="infoArchivo">Información del Archivo</label>
            <input
              type="text"
              name="infoArchivo"
              id="infoArchivo"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.infoArchivo}
              onChange={handleInputChange}
            />
          </div>

          {/* Fechas */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2" htmlFor="fechaInicio">Fecha de Inicio</label>
              <input
                type="date"
                name="fechaInicio"
                id="fechaInicio"
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
                value={formData.fechaInicio}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2" htmlFor="fechaActualizacion">Fecha de Actualización</label>
              <input
                type="date"
                name="fechaActualizacion"
                id="fechaActualizacion"
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
                value={formData.fechaActualizacion}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2" htmlFor="fechaNotificacion">Fecha de Notificación</label>
              <input
                type="date"
                name="fechaNotificacion"
                id="fechaNotificacion"
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
                value={formData.fechaNotificacion}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="descripcion">Descripción</label>
            <textarea
              name="descripcion"
              id="descripcion"
              rows="3"
              className="border border-gray-300 p-3 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.descripcion}
              onChange={handleInputChange}
            />
          </div>

          {/* Procesos relacionados con documentos 
          {formData.procesosDocumentos.length > 0 && (
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2" htmlFor="procesosDocumentos">Documentos Relacionados</label>
              <ul>
                {formData.procesosDocumentos.map((doc, index) => (
                  <li key={index}>
                    {doc.idDocumentoNavigation.codigoDoc} - {doc.idDocumentoNavigation.asuntoDoc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          */}
          {/* Botón de actualizar */}
          <div className="flex justify-between items-center mb-6">
            <button
              type="submit"
              className="bg-azul text-white px-6 py-2 rounded-md hover:bg-amarillo transition-all"
            >
              Actualizar Proceso
            </button>
          </div>
        </div>
        <div className="mt-10 text-center p-5 bg-amarillo rounded-lg">
          <h2 className="text-2xl font-bold text-white">¡Cada proceso cuenta! 📝</h2>
          <p className="text-lg text-white">Recuerda que cada detalle en este proceso es esencial para mantener la precisión y el éxito en tus proyectos. ¡Sigue editando con dedicación! 💡</p>
        </div>
      </div>
    </form>
  );
};

export default EditProcessForm;
