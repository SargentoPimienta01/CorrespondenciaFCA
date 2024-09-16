import React, { useState, useEffect } from 'react';

export const Search = ({ className }) => (
    <svg className={className} role="img" fill="#000000" height="20" width="20" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" 
	 viewBox="0 0 488.4 488.4">
		<path d="M0,203.25c0,112.1,91.2,203.2,203.2,203.2c51.6,0,98.8-19.4,134.7-51.2l129.5,129.5c2.4,2.4,5.5,3.6,8.7,3.6
			s6.3-1.2,8.7-3.6c4.8-4.8,4.8-12.5,0-17.3l-129.6-129.5c31.8-35.9,51.2-83,51.2-134.7c0-112.1-91.2-203.2-203.2-203.2
			S0,91.15,0,203.25z M381.9,203.25c0,98.5-80.2,178.7-178.7,178.7s-178.7-80.2-178.7-178.7s80.2-178.7,178.7-178.7
			S381.9,104.65,381.9,203.25z"/>
    </svg>
  )

  const ProcessList = () => {
    const [procesos, setProcesos] = useState([]); // Estado para almacenar los procesos
    const [filteredProcesos, setFilteredProcesos] = useState([]); // Estado para manejar los procesos filtrados
    const [loading, setLoading] = useState(true); // Estado para manejar la carga
    const [error, setError] = useState(null); // Estado para manejar errores
  
    useEffect(() => {
      const fetchProcesos = async () => {
        const token = localStorage.getItem('token'); // Obtener el token de localStorage
    
        try {
          const response = await fetch('http://localhost:5064/api/procesos', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`, // Enviar el token en el encabezado
              'Content-Type': 'application/json'
            }
          });
    
          if (!response.ok) {
            throw new Error('Error al obtener los procesos');
          }
    
          const result = await response.json();
          
          console.log('Respuesta de la API:', result);
    
          // Verifica si el array está dentro de result.data.procesos
          if (result.data && Array.isArray(result.data.procesos)) {
            setProcesos(result.data.procesos); // Actualiza el estado con los procesos obtenidos
            setFilteredProcesos(result.data.procesos); // Inicialmente, muestra todos los procesos
          } else {
            throw new Error('La respuesta no contiene un array de procesos');
          }
    
          setLoading(false); // Detiene la carga
        } catch (err) {
          setError(err.message); // Maneja el error
          setLoading(false); // Detiene la carga
        }
      };
    
      fetchProcesos();
    }, []);
  
    // Función para filtrar procesos por código
    const filterProcesos = (searchTerm) => {
      setFilteredProcesos(procesos.filter(proceso =>
        proceso.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    };
  
    // Función para manejar el click en un proceso
    const handleProcessClick = (e, procesoId) => {
      e.stopPropagation(); // Detiene la propagación al padre
      console.log(`Clicked on process ID: ${procesoId}`);
      navigate(`/procesos/${procesoId}`);
    };
  
    // Muestra un mensaje de carga o de error
    if (loading) return <p>Cargando procesos...</p>;
    if (error) return <p>Error: {error}</p>;
  
    return (
      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <a href="/nuevo-proceso" className="hover: no-underline">
            <button 
              className="bg-azul text-white px-4 py-2 rounded cursor-pointer mr-5 transform hover:bg-amarillo hover:scale-105 transition-colors duration-300 ease-in-out"
            >
              + Añadir Proceso
            </button>
          </a>
          <label htmlFor="codigo-documento" className="sr-only">Código del documento</label>
          <input
            id="codigo-documento"
            name="codigoDocumento"
            type="text"
            placeholder="Código del documento"
            className="flex-1 px-2 py-1 border border-black rounded"
            onChange={(e) => filterProcesos(e.target.value)}
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
          {Array.isArray(filteredProcesos) && filteredProcesos.length > 0 ? (
            filteredProcesos.map(proceso => (
              <div
                key={proceso.idProceso} 
                className="bg-gray-200 hover:bg-gray-300 transition-colors duration-200 ease-in-out rounded-lg overflow-hidden shadow-md cursor-pointer"
                onClick={(e) => handleProcessClick(e, proceso.id)}
              >
                <div className='p-4'>
                  <a href={`/procesos/${proceso.idProceso}`} className="hover:text-azul hover:no-underline">
                    <div className="flex justify-between w-full mb-2">
                      <span className="text-lg font-bold text-gray-800">{proceso.codigo || `Proceso #${proceso.idProceso}`}</span>
                      <span className="text-sm text-gray-500">{new Date(proceso.fechaInicio).toLocaleDateString()}</span>
                    </div>
                  <div className="text-gray-600">
                    {proceso.descripcion || 'Sin descripción disponible'}
                  </div>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p>No hay procesos disponibles.</p>
          )}
        </div>
  
        <div className="flex justify-center mt-5">
          <button className="px-4 py-1 bg-gray-300 mr-2 cursor-pointer hover:bg-gray-400">Previous</button>
          <span className="px-4 py-1 font-bold">1</span>
          <button className="px-4 py-1 bg-gray-300 ml-2 cursor-pointer hover:bg-gray-400">Next</button>
        </div>
      </div>
    );
  };
  
  export default ProcessList;
