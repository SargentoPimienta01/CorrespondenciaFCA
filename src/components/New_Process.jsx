import React, { useState } from 'react';
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

const NewProcessForm = () => {
  const [formData, setFormData] = useState({
    nombre: '', // Nuevo campo para el nombre
    fechaInicio: '',
    fechaActualizacion: '',
    fechaNotificacion: '',
    descripcion: '',
    infoArchivo: '',
  });

  // Manejar los cambios en los inputs del formulario
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getTokenFromCookie();
    if (!token) {
      Swal.fire({
        title: 'Error!',
        text: 'No se ha encontrado el token de autenticación. Redirigiendo al login.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return redirectToLogin();
    }

    try {
      const url = 'http://32768:8080/api/procesos';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al enviar los datos del proceso');
      }

      const result = await response.json();
      console.log('Proceso enviado:', result);

      // Mostrar alerta de éxito
      Swal.fire({
        title: 'Proceso registrado!',
        text: 'El proceso se ha registrado exitosamente.',
        icon: 'success',
        confirmButtonText: 'OK'
      });

      // Resetear el formulario
      setFormData({
        nombre: '',
        fechaInicio: '',
        fechaActualizacion: '',
        fechaNotificacion: '',
        descripcion: '',
        infoArchivo: '',
      });

    } catch (error) {
      console.error('Hubo un problema al enviar los datos del proceso:', error);
      
      // Mostrar alerta de error
      Swal.fire({
        title: 'Error!',
        text: 'Hubo un problema al registrar el proceso.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Campo para Nombre */}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Fechas */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
        </div>

        <div className="mb-4">
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
            Subir Datos
          </button>
        </div>
      </form>
      <div className="mt-10 text-center p-5 bg-amarillo rounded-lg">
        <h2 className="text-2xl font-bold text-white">¡Cada documento cuenta! 📄</h2>
        <p className="text-lg text-white">Recuerda que cada detalle en este documento es esencial para mantener la precisión y el éxito en tus proyectos. ¡Sigue editando con dedicación! 💡</p>
      </div>
    </div>
  );
};

export default NewProcessForm;
