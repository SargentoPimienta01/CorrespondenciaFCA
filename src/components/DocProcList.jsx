import React, { useState, useEffect } from 'react';

export const Search = ({ className }) => (
  <svg className={className} role="img" fill="#000000" height="20" width="20" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 488.4 488.4">
    <path d="M0,203.25c0,112.1,91.2,203.2,203.2,203.2c51.6,0,98.8-19.4,134.7-51.2l129.5,129.5c2.4,2.4,5.5,3.6,8.7,3.6
      s6.3-1.2,8.7-3.6c4.8-4.8,4.8-12.5,0-17.3l-129.6-129.5c31.8-35.9,51.2-83,51.2-134.7c0-112.1-91.2-203.2-203.2-203.2
      S0,91.15,0,203.25z M381.9,203.25c0,98.5-80.2,178.7-178.7,178.7s-178.7-80.2-178.7-178.7s80.2-178.7,178.7-178.7
      S381.9,104.65,381.9,203.25z"/>
  </svg>
);

const DocumentList = ({ procesoId }) => {
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado de error

  useEffect(() => {
    const fetchDocuments = async () => {
      const token = localStorage.getItem('token'); // Obtener el token de localStorage

      try {
        const response = await fetch(`http://localhost:5064/api/ProcesosDocumentos/${procesoId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener los documentos');
        }

        const result = await response.json();
        const documentos = result.data.procesoDocumento;

        setFilteredDocuments([documentos]); // Actualizar el estado con los documentos obtenidos
        setLoading(false); // Detener la carga
      } catch (err) {
        setError(err.message); // Manejar el error
        setLoading(false); // Detener la carga
      }
    };

    if (procesoId) {
      fetchDocuments();
    }
  }, [procesoId]);

  // Mostrar un mensaje de carga o de error
  if (loading) return <p>Cargando documentos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <a href="/nuevo-documento" className="hover:no-underline">
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
          onChange={(e) => {
            const searchTerm = e.target.value.toLowerCase();
            setFilteredDocuments(prevDocuments => 
              prevDocuments.filter(documento =>
                documento.idDocumento.toString().includes(searchTerm)
              )
            );
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((documento) => (
            <div
              key={documento.idDocumento}
              className="bg-gray-200 hover:bg-gray-300 transition-colors duration-200 ease-in-out rounded-lg overflow-hidden shadow-md cursor-pointer"
            >
              <div className="p-4">
                <a href={`/documentos/${documento.idDocumento}`} className="hover:text-azul hover:no-underline">
                  <div className="flex justify-between w-full mb-2">
                    <span className="text-lg font-bold text-gray-800">Documento #{documento.idDocumento}</span>
                  </div>
                  <div className="text-gray-600">
                    Detalles del documento {documento.idDocumento}
                  </div>
                </a>
              </div>            
            </div>
          ))
        ) : (
          <p>No hay documentos disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
