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

const DocumentList = () => {
  const [documents, setDocuments] = useState([]); // Estado para almacenar los documentos
  const [filteredDocuments, setFilteredDocuments] = useState([]); // Estado para manejar los documentos filtrados
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [error, setError] = useState(null); // Estado para manejar errores

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No se ha encontrado un token de autenticación');
        }

        const response = await fetch('http://localhost:5064/api/documentos', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener los documentos');
        }

        const result = await response.json();
        console.log('Documentos obtenidos:', result);

        if (result.data && Array.isArray(result.data.documentos)) {
          setDocuments(result.data.documentos);
          setFilteredDocuments(result.data.documentos);
        } else {
          throw new Error('La API no devolvió un array de documentos');
        }

        setLoading(false);
      } catch (error) {
        setError(error.message);
        console.error('Error al obtener los documentos:', error.message);
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filterDocuments = (searchTerm) => {
    const filtered = documents.filter(documento =>
      documento.codigoDoc.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocuments(filtered);
  };

  const handleDocumentClick = (documentoId) => {
    console.log(`Clicked on document ID: ${documentoId}`);
    window.location.href = `/documentos/${documentoId}`;
  };

  // Función que asigna la clase CSS según la fechaPlazo y el estado
  const getDocumentColor = (fechaPlazo, estado) => {
    const today = new Date();
    const deadline = new Date(fechaPlazo);
    const differenceInDays = (deadline - today) / (1000 * 3600 * 24);

    if (estado === 'concluido') {
      return { color: 'bg-green-500', importance: 5 }; // Menor importancia
    } else if (differenceInDays < 0) {
      return { color: 'bg-slate-400', importance: 1 }; // Mayor importancia
    } else if (differenceInDays <= 2) {
      return { color: 'bg-red-300', importance: 2 }; // Alta importancia
    } else if (differenceInDays <= 7) {
      return { color: 'bg-orange-300', importance: 3 }; // Media importancia
    } else {
      return { color: 'bg-gray-200', importance: 4 }; // Menor importancia
    }
  };

  // Ordenar documentos por importancia
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    const aColor = getDocumentColor(a.fechaPlazo, a.estado);
    const bColor = getDocumentColor(b.fechaPlazo, b.estado);
    return aColor.importance - bColor.importance; // Ordena según la importancia
  });

  if (loading) return <div>Cargando documentos...</div>;
  if (error) return <div>Error: {error}</div>;

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
          onChange={(e) => filterDocuments(e.target.value)}
        />
        <button
          id="buscar-btn"
          name="buscar"
          className="bg-transparent border-none cursor-pointer ml-2"
        >
          <Search className="text-black w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {sortedDocuments.map(documento => {
          const { color } = getDocumentColor(documento.fechaPlazo, documento.estado);
          return (
            <div
              key={documento.idDocumento}
              className={`transition-colors duration-200 ease-in-out rounded-lg overflow-hidden shadow-md cursor-pointer ${color}`}
              onClick={() => handleDocumentClick(documento.idDocumento)}
            >
              <div className="p-4">
                <a href={`/documentos/${documento.idDocumento}`} className="hover:text-azul hover:no-underline">
                  <div className="flex justify-between w-full mb-2">
                    <span className="text-lg font-bold text-gray-800">{documento.codigoDoc}</span>
                    <span className="text-sm text-gray-500">{documento.fechaRecepcionFca}</span>
                  </div>
                  <div className="text-gray-600">
                    {documento.asuntoDoc}
                  </div>
                </a>
              </div>
            </div>
          );
        })}
        <div className="mt-10 text-center p-5 bg-amarillo rounded-lg">
          <h2 className="text-2xl font-bold text-white">¡Cada documento cuenta! 📄</h2>
          <p className="text-lg text-white">Recuerda que cada detalle en este documento es esencial para mantener la precisión y el éxito en tus proyectos. ¡Sigue editando con dedicación! 💡</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;
