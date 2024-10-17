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
  deleteToken();
  window.location.href = '/';
};

// Función para formatear las fechas en el formato esperado por la API
const formatDateForAPI = (date) => {
  return new Date(date).toISOString().slice(0, 19);
};

const EditProcessForm = ({ idProceso }) => {
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaActualizacion: '',
    fechaNotificacion: '',
    descripcion: '',
    infoArchivo: '',
    nombre: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idProceso) {
      console.error("idProceso is undefined");
      return;
    }

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
        const processData = result.data.proceso;

        if (processData) {
          setFormData({
            fechaInicio: processData.fechaInicio ? processData.fechaInicio.split('T')[0] : '',
            fechaActualizacion: processData.fechaActualizacion ? processData.fechaActualizacion.split('T')[0] : '',
            fechaNotificacion: processData.fechaNotificacion ? processData.fechaNotificacion.split('T')[0] : '',
            descripcion: processData.descripcion || '',
            infoArchivo: processData.infoArchivo || '',
            nombre: processData.nombre || '',
          });
        } else {
          throw new Error('El objeto proceso está vacío o malformado');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los datos del proceso:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [idProceso]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!idProceso) {
      console.error("idProceso is undefined");
      Swal.fire({
        title: 'Error!',
        text: 'ID de proceso no válido.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }
  
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
      idProceso, // Incluye el ID en el cuerpo de la solicitud
      ...formData,
      fechaInicio: formatDateForAPI(formData.fechaInicio),
      fechaActualizacion: formatDateForAPI(formData.fechaActualizacion),
      fechaNotificacion: formatDateForAPI(formData.fechaNotificacion),
    };
  
    try {
      const response = await fetch(`http://localhost:5064/api/procesos/${idProceso}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
  
      if (!response.ok) {
        const errorDetails = await response.json();
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

  if (loading) {
    return <div>Cargando datos del proceso...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="nombre">Nombre del Proceso</label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.nombre}
              onChange={handleInputChange}
            />
          </div>

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
          {['fechaInicio', 'fechaActualizacion', 'fechaNotificacion'].map((field, idx) => (
            <div className="flex flex-col" key={idx}>
              <label className="text-sm font-semibold mb-2" htmlFor={field}>
                {field === 'fechaInicio' ? 'Fecha de Inicio' : field === 'fechaActualizacion' ? 'Fecha de Actualización' : 'Fecha de Notificación'}
              </label>
              <input
                type="date"
                name={field}
                id={field}
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
                value={formData[field]}
                onChange={handleInputChange}
              />
            </div>
          ))}

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
