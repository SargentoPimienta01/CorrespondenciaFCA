import React, { useState } from 'react';

export const Search = ({ className }) => (
  <svg className={className} role="img" fill="#000000" height="20" width="20" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
 viewBox="0 0 488.4 488.4" xml:space="preserve">
  <path d="M0,203.25c0,112.1,91.2,203.2,203.2,203.2c51.6,0,98.8-19.4,134.7-51.2l129.5,129.5c2.4,2.4,5.5,3.6,8.7,3.6
    s6.3-1.2,8.7-3.6c4.8-4.8,4.8-12.5,0-17.3l-129.6-129.5c31.8-35.9,51.2-83,51.2-134.7c0-112.1-91.2-203.2-203.2-203.2
    S0,91.15,0,203.25z M381.9,203.25c0,98.5-80.2,178.7-178.7,178.7s-178.7-80.2-178.7-178.7s80.2-178.7,178.7-178.7
    S381.9,104.65,381.9,203.25z"/>
  </svg>
);

// Simulación de los datos de documentos (luego los conectarás con la API)
const documentos = [
  {
    id_documento: 1,
    codigo_doc: 'ATT-20230905-001',
    fecha_recepcion_fca: '2024-09-01 09:30',
    fecha_entrega: '2024-09-05 17:00',
    fecha_plazo: '2024-09-10 17:00',
    asunto_doc: 'Solicitud de actualización de regulaciones',
    observaciones: 'Ninguna observación',
    tipo_documento: 'Regulación',
    id_encargado: 1
  },
  {
    id_documento: 2,
    codigo_doc: 'ATT-20230905-002',
    fecha_recepcion_fca: '2024-09-02 10:15',
    fecha_entrega: '2024-09-06 12:00',
    fecha_plazo: '2024-09-12 12:00',
    asunto_doc: 'Informe técnico anual',
    observaciones: 'Pendiente de revisión por el área técnica',
    tipo_documento: 'Informe',
    id_encargado: 2
  },
  // Más documentos...
];

const DocumentList = () => {
  const [filteredDocuments, setFilteredDocuments] = useState(documentos);

  const filterDocuments = (searchTerm) => {
    const filtered = documentos.filter(documento =>
      documento.codigo_doc.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocuments(filtered);
  };

  const handleDocumentClick = (documentoId) => {
    console.log(`Clicked on document ID: ${documentoId}`);
    navigate(`/documentos/${documentoId}`);
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
      <a
        href="/nuevo-documento"
        className="hover:no-underline"
      >
        <button 
          className="bg-azul text-white px-4 py-2 rounded cursor-pointer mr-5 transform hover:bg-amarillo hover:scale-105 transition-colors duration-300 ease-in-out"
        >
          + Añadir Documento
        </button>
      </a>
        <label htmlFor="codigo-documento" className="sr-only">Código del documento</label>
        <input
          id="codigo-documento"
          name="codigoDocumento"
          type="text"
          placeholder="Código del documento"
          className="flex-1 px-2 py-1 border border-black rounded"
          onChange={(e) => filterDocuments(e.target.value)}
        />
        <button 
          id="buscar-btn"
          name="buscar"
          className="bg-transparent border-none cursor-pointer ml-2" 
          onClick={() => alert('Buscar Documento')}>
            <Search className="text-black w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
      {filteredDocuments.map(documento => (
        <div
          key={documento.id_documento}
          className="bg-gray-200 hover:bg-gray-300 transition-colors duration-200 ease-in-out rounded-lg overflow-hidden shadow-md cursor-pointer"
          onClick={() => handleDocumentClick(documento.id_documento)}
        >
          <div className="p-4">
            <a href={`/documentos/${documento.id_documento}`} className="hover:text-azul hover:no-underline" >
              <div className="flex justify-between w-full mb-2">
                <span className="text-lg font-bold text-gray-800">{documento.codigo_doc}</span>
                <span className="text-sm text-gray-500">{documento.fecha_recepcion_fca}</span>
              </div>
              <div className="text-gray-600">
                {documento.asunto_doc}
              </div>
            </a>
          </div>            
        </div>
      ))}
    </div>

    </div>
  );
};

export default DocumentList;