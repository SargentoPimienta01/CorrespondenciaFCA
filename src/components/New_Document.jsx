import React, { useState } from 'react';
import Swal from 'sweetalert2';

const NewDocumentForm = ({ usuarios }) => {
  const [formData, setFormData] = useState({
    codigoDoc: '',
    fechaRecepcionFca: '',
    fechaEntrega: '',
    fechaPlazo: '',
    asuntoDoc: '',
    observaciones: '',
    tipoDocumento: '',
    ultimaVersion: 1,  // Por defecto, versión inicial
    idEncargado: usuarios[0]?.idUsuario || '' // Selecciona el primer usuario como encargado por defecto
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString();  // Aseguramos que la fecha esté bien formateada
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Se ha ejecutado handleSubmit");

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se ha encontrado un token de autenticación');
      return;
    }

    // Formatear las fechas a ISO 8601
    const formattedData = {
      ...formData,
      fechaRecepcionFca: formatDate(formData.fechaRecepcionFca),
      fechaEntrega: formatDate(formData.fechaEntrega),
      fechaPlazo: formatDate(formData.fechaPlazo),
    };

    console.log('Datos que se enviarán:', JSON.stringify(formattedData, null, 2));

    try {
      const response = await fetch('http://localhost:5064/api/documentos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      console.log("Se envió la solicitud");

      if (!response.ok) {
        throw new Error('Error al registrar el documento');
      }

      const result = await response.json();
      console.log('Nuevo documento creado:', result);
      Swal.fire('Éxito', 'Documento registrado con éxito', 'success');
    } catch (error) {
      console.error('Hubo un problema al registrar el documento:', error);
      Swal.fire('Error', 'Hubo un problema al registrar el documento', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="codigoDoc">Código del Documento</label>
            <input
              type="text"
              name="codigoDoc"
              id="codigoDoc"
              required
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.codigoDoc}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="idEncargado">Encargado</label>
            <select
              name="idEncargado"
              id="idEncargado"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.idEncargado}
              onChange={handleInputChange}
            >
              {usuarios.map((usuario) => (
                <option key={usuario.idUsuario} value={usuario.idUsuario}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="fechaRecepcionFca">Fecha de Recepción FCA</label>
            <input
              type="date"
              name="fechaRecepcionFca"
              id="fechaRecepcionFca"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.fechaRecepcionFca}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="fechaEntrega">Fecha de Entrega</label>
            <input
              type="date"
              name="fechaEntrega"
              id="fechaEntrega"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.fechaEntrega}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="fechaPlazo">Fecha Límite</label>
            <input
              type="date"
              name="fechaPlazo"
              id="fechaPlazo"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.fechaPlazo}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="tipoDocumento">Tipo de Documento</label>
            <select
              name="tipoDocumento"
              id="tipoDocumento"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.tipoDocumento}
              onChange={handleInputChange}
            >
              <option value="">Seleccione un tipo</option>
              <option value="Informe">Informe</option>
              <option value="Propuesta">Propuesta</option>
              <option value="Contrato">Contrato</option>
              <option value="Solicitud">Solicitud</option>
              <option value="Notificación">Notificación</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-semibold mb-2" htmlFor="asuntoDoc">Asunto</label>
          <textarea
            name="asuntoDoc"
            id="asuntoDoc"
            rows="3"
            className="border border-gray-300 p-3 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-amarillo"
            value={formData.asuntoDoc}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-semibold mb-2" htmlFor="observaciones">Observaciones</label>
          <textarea
            name="observaciones"
            id="observaciones"
            rows="3"
            className="border border-gray-300 p-3 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-amarillo"
            value={formData.observaciones}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            type="submit"
            className="bg-azul text-white px-6 py-2 rounded-md hover:bg-amarillo transition-all"
          >
            Registrar Documento
          </button>
        </div>
        <div className="mt-10 text-center p-5 bg-amarillo rounded-lg">
          <h2 className="text-2xl font-bold text-white">¡Cada documento cuenta! 📄</h2>
          <p className="text-lg text-white">Recuerda que cada detalle en este documento es esencial para mantener la precisión y el éxito en tus proyectos. ¡Sigue editando con dedicación! 💡</p>
        </div>
      </form>
    </div>
  );
};

export default NewDocumentForm;
