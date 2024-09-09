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
    fecha: '20/12/2023',
  },
  // Más procesos...
];

const ProcessList = () => {
  const [filteredProcesos, setFilteredProcesos] = useState(procesos);

  const filterProcesos = (searchTerm) => {
    const filtered = procesos.filter(proceso =>
      proceso.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProcesos(filtered);
  };

  // Definición de estilos en línea
  const styles = {
    container: {
      padding: '20px',
    },
    title: {
      textAlign: 'center',
      fontSize: '24px',
      marginBottom: '20px',
    },
    searchBar: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '20px',
    },
    input: {
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
    },
    button: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      marginLeft: '10px',
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    item: {
      backgroundColor: '#ccc',
      padding: '15px',
      borderRadius: '10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      transition: 'all 0.2s ease',
    },
    itemHover: {
      backgroundColor: '#b5b5b5',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: '10px',
    },
    codigo: {
      fontWeight: 'bold',
      color: '#333',
    },
    fecha: {
      fontWeight: 'normal',
      color: '#555',
    },
    descripcion: {
      fontSize: '0.9rem',
      color: '#666',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20px',
    },
    paginationButton: {
      padding: '5px 10px',
      backgroundColor: '#ddd',
      border: 'none',
      margin: '0 5px',
      cursor: 'pointer',
    },
    paginationButtonHover: {
      backgroundColor: '#ccc',
    },
    currentPage: {
      padding: '5px 10px',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="Código del documento"
          style={styles.input}
          onInput={(e) => filterProcesos(e.target.value)}
        />
        <button style={styles.button}>🔍</button>
      </div>

      <div style={styles.list}>
        {filteredProcesos.map(proceso => (
          <div
            key={proceso.id}
            style={{ ...styles.item }}
          >
            <div style={styles.header}>
              <span style={styles.codigo}>{proceso.codigo}</span>
              <span style={styles.fecha}>{proceso.fecha}</span>
            </div>
            <div style={styles.descripcion}>
              {proceso.descripcion}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.pagination}>
        <button style={styles.paginationButton}>Previous</button>
        <span style={styles.currentPage}>1</span>
        <button style={styles.paginationButton}>Next</button>
      </div>
    </div>
  );
};

export default ProcessList;
