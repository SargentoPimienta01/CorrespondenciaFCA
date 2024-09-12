import React, { useState } from 'react';

// Este componente necesita que se le pase una lista de encargados desde el servidor
const NewDocumentForm = ({ usuarios }) => {
  const [formData, setFormData] = useState({
    codigo_doc: '',
    fecha_recepcion_fca: '',
    fecha_entrega: '',
    fecha_plazo: '',
    asunto_doc: '',
    observaciones: '',
    tipo_documento: '',
    id_encargado: usuarios[0]?.id_usuario || ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Nuevo documento creado:', formData);
    // Aquí podrías enviar los datos al backend para insertar en la base de datos
    // fetch('/api/documentos', { method: 'POST', body: JSON.stringify(formData) })
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="codigo_doc">Código del Documento</label>
            <input
              type="text"
              name="codigo_doc"
              id="codigo_doc"
              required
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.codigo_doc}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="id_encargado">Encargado</label>
            <select
              name="id_encargado"
              id="id_encargado"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.id_encargado}
              onChange={handleInputChange}
            >
              {usuarios.map((usuario) => (
                <option key={usuario.id_usuario} value={usuario.id_usuario}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="fecha_recepcion_fca">Fecha de Recepción FCA</label>
            <input
              type="date"
              name="fecha_recepcion_fca"
              id="fecha_recepcion_fca"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.fecha_recepcion_fca}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="fecha_entrega">Fecha de Entrega</label>
            <input
              type="date"
              name="fecha_entrega"
              id="fecha_entrega"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.fecha_entrega}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="fecha_plazo">Fecha Límite</label>
            <input
              type="date"
              name="fecha_plazo"
              id="fecha_plazo"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.fecha_plazo}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="tipo_documento">Tipo de Documento</label>
            <select
              name="tipo_documento"
              id="tipo_documento"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.tipo_documento}
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
          <label className="text-sm font-semibold mb-2" htmlFor="asunto_doc">Asunto</label>
          <textarea
            name="asunto_doc"
            id="asunto_doc"
            rows="3"
            className="border border-gray-300 p-3 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-amarillo"
            value={formData.asunto_doc}
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
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold">Subir Documento</label>
            <input type="file" className="text-sm" />
          </div>
          <button
            type="submit"
            className="bg-azul text-white px-6 py-2 rounded-md hover:bg-amarillo transition-all"
          >
            Registrar Documento
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewDocumentForm;
