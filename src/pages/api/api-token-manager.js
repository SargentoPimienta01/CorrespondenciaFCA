// public/js/token-manager.js
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      document.cookie = `token=${token}; path=/;`;
    } else {
      console.error('No se encontró el token en el localStorage');
    }
  });
  