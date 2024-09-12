import React, { useState } from 'react';

const NewProcessForm = ({
  idDocumento = '',
  fechaIngreso = '',
  fechaLimite = '',
  asignado = '',
  asunto = '',
  documentosRelacionados = '',
  comentarios = '',
  instruccion = '',
  isEdit = false
}) => {
  const [formData, setFormData] = useState({
    idDocumento,
    fechaIngreso,
    fechaLimite,
    asignado,
    asunto,
    documentosRelacionados,
    comentarios,
    instruccion
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos enviados:', formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-3xl font-bold text-center mb-8">{isEdit ? 'Editar Proceso' : 'Nuevo Proceso'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="idDocumento">ID del Documento (Nombre Único)</label>
            <input
              type="text"
              name="idDocumento"
              id="idDocumento"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.idDocumento}
              onChange={handleInputChange}
              readOnly={isEdit} // Si es edición, el ID es solo lectura
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="asignado">Asignado</label>
            <input
              type="text"
              name="asignado"
              id="asignado"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.asignado}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="fechaIngreso">Fecha de Ingreso</label>
            <input
              type="date"
              name="fechaIngreso"
              id="fechaIngreso"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.fechaIngreso}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="fechaLimite">Fecha Límite</label>
            <input
              type="date"
              name="fechaLimite"
              id="fechaLimite"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.fechaLimite}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-semibold mb-2" htmlFor="asunto">Asunto</label>
          <textarea
            name="asunto"
            id="asunto"
            rows="3"
            className="border border-gray-300 p-3 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-amarillo"
            value={formData.asunto}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="documentosRelacionados">Documentos Relacionados</label>
            <textarea
              name="documentosRelacionados"
              id="documentosRelacionados"
              rows="3"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.documentosRelacionados}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="instruccion">Instrucción</label>
            <textarea
              name="instruccion"
              id="instruccion"
              rows="3"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.instruccion}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-semibold mb-2" htmlFor="comentarios">Comentarios</label>
          <textarea
            name="comentarios"
            id="comentarios"
            rows="4"
            className="border border-gray-300 p-3 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-amarillo"
            value={formData.comentarios}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold">Cargar Documento</label>
            <input type="file" className="text-sm" />
          </div>
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
