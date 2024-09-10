import React, { useState } from 'react';

export const Search = ({ className }) => (
    <svg className={className} role="img" fill="#000000" height="20" width="20" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 488.4 488.4" xml:space="preserve">
		<path d="M0,203.25c0,112.1,91.2,203.2,203.2,203.2c51.6,0,98.8-19.4,134.7-51.2l129.5,129.5c2.4,2.4,5.5,3.6,8.7,3.6
			s6.3-1.2,8.7-3.6c4.8-4.8,4.8-12.5,0-17.3l-129.6-129.5c31.8-35.9,51.2-83,51.2-134.7c0-112.1-91.2-203.2-203.2-203.2
			S0,91.15,0,203.25z M381.9,203.25c0,98.5-80.2,178.7-178.7,178.7s-178.7-80.2-178.7-178.7s80.2-178.7,178.7-178.7
			S381.9,104.65,381.9,203.25z"/>
    </svg>
  )

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
    const [filteredProcesos, setFilteredProcesos] = useState(procesos); // Estado para manejar hover
  
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
