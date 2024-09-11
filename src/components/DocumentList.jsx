import React, { useState } from 'react';

const procesos = [
    {
      id: 1,
      codigo: 'ATT-DJ-A TR LP 449/2022',
      descripcion: 'Formulación cargos incumplimientos custodia área operativa Viacha-Guasqui gestión 2021.',
      fecha: '27/12/2022',
    },
    {
      id: 2,
      codigo: 'ATT-DJ-A TR LP 450/2022',
      descripcion: 'Otro proceso ejemplo descripción.',
      fecha: '28/12/2022',
    },
    {
      id: 3,
      codigo: 'ATT-DJ-A TR LP 420/2023',
      descripcion: 'Propuesta de nuevas tarifas ATT',
      fecha: '20/02/2023',
    },
    {
      id: 4,
      codigo: 'ATT-DJ-A TR LP 430/2023',
      descripcion: 'Revisión de contrato ATT',
      fecha: '23/04/2023',
    },
    {
      id: 5,
      codigo: 'ATT-DJ-A TR LP 440/2023',
      descripcion: 'Modificación de solicitud ATT',
      fecha: '28/09/2023',
    },
    // Más procesos...
  ];
  

const ProcessList = () => {
    const [filteredProcesos, setFilteredProcesos] = useState(procesos);
    const [hoveredId, setHoveredId] = useState(null); // Estado para manejar hover
  
    const filterProcesos = (searchTerm) => {
      setFilteredProcesos(procesos.filter(proceso =>
        proceso.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    };

    const handleProcessClick = (e, procesoId) => {
      e.stopPropagation();  // Detiene la propagación al padre
      alert(`Detalles del proceso ${procesoId}`);
    };
  
    return (
      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <button 
            className="bg-azul text-white px-4 py-2 rounded cursor-pointer mr-5 transform hover:bg-amarillo hover:scale-105 transition-colors duration-300 ease-in-out"
            onClick={() => alert('Agregar nuevo proceso')}
          >
            + Añadir Proceso
          </button>
          <input
            type="text"
            placeholder="Código del documento"
            className="flex-1 px-2 py-1 border border-black rounded"
            onChange={(e) => filterProcesos(e.target.value)}
          />
          <button className="bg-transparent border-none cursor-pointer ml-2" onClick={() => alert('Buscar procesos')}>
            <Search className="text-black w-5 h-5" />
          </button>
        </div>
  
        <div className="flex flex-col gap-3">
          {filteredProcesos.map(proceso => (
            <div
              key={proceso.id}
              className="bg-gray-200 hover:bg-gray-300 transition-colors duration-200 ease-in-out rounded-lg overflow-hidden shadow-md cursor-pointer"
              onClick={(e) => handleProcessClick(e, proceso.id)}
            >
              <div className='p-4'>
                <div className="flex justify-between w-full mb-2">
                  <span className="text-lg font-bold text-gray-800">{proceso.codigo}</span>
                  <span className="text-sm text-gray-500">{proceso.fecha}</span>
                </div>
                <div className="text-gray-600">
                  {proceso.descripcion}
                </div>
              </div>
            </div>
          ))}
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