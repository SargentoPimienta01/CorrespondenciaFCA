import React, { useState } from 'react';

const NewProcessForm = ({
  idProceso = '', // ID único del proceso
  fechaInicio = '', // Fecha de inicio del proceso
  fechaActualizacion = '', // Fecha de la última actualización
  fechaNotificacion = '', // Fecha de notificación
  descripcion = '', // Descripción del proceso (Asunto)
  infoArchivo = '', // Archivo relacionado
  isEdit = false // Si se está editando un proceso existente
}) => {
  const [formData, setFormData] = useState({
    idProceso,
    fechaInicio: fechaInicio ? new Date(fechaInicio).toISOString().split('T')[0] : '', // Formato de fecha
    fechaActualizacion: fechaActualizacion ? new Date(fechaActualizacion).toISOString().split('T')[0] : '', // Formato de fecha
    fechaNotificacion: fechaNotificacion ? new Date(fechaNotificacion).toISOString().split('T')[0] : '',
    descripcion, // El campo de descripción
    infoArchivo, // Archivo relacionado
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se ha encontrado un token de autenticación');
      return;
    }

    try {
      const url = isEdit
        ? `http://localhost:5064/api/procesos/${formData.idProceso}` // Si es edición
        : 'http://localhost:5064/api/procesos'; // Si es nuevo
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idProceso: formData.idProceso,
          fechaInicio: formData.fechaInicio,
          fechaActualizacion: formData.fechaActualizacion,
          fechaNotificacion: formData.fechaNotificacion,
          descripcion: formData.descripcion,
          infoArchivo: formData.infoArchivo,
        })
      });

      if (!response.ok) {
        throw new Error('Error al enviar los datos del proceso');
      }

      const result = await response.json();
      console.log('Proceso enviado:', result);
      alert(isEdit ? 'Proceso actualizado correctamente' : 'Proceso creado correctamente');

    } catch (error) {
      console.error('Hubo un problema al enviar los datos del proceso:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="idProceso">ID del Proceso</label>
            <input
              type="text"
              name="idProceso"
              id="idProceso"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.idProceso}
              onChange={handleInputChange}
              readOnly={isEdit} // Si es edición, el ID es solo lectura
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
            {isEdit ? 'Guardar Cambios' : 'Subir Datos'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProcessForm;

