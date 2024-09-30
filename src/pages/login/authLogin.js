// Función para verificar si estamos en el cliente
function isClient() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

// Función para obtener el valor de una cookie por su nombre
function getCookie(name) {
  if (!isClient()) return null; // Solo se ejecuta en el cliente
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Función para eliminar una cookie
function deleteCookie(name) {
  if (!isClient()) return; // Solo se ejecuta en el cliente
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Clase de autenticación
class Auth {
  constructor() {
    // Inicializamos el token y expiry
    this.token = null;
    this.expiry = null;

    if (isClient()) {
      // Obtenemos el token de localStorage o cookies (si está en cualquiera de los dos)
      this.token = localStorage.getItem("token") || getCookie("token");
      this.expiry = localStorage.getItem("expiry") || getCookie("expiry");
    }
  }

  isAuthenticated() {
    // Verificamos si hay un token
    if (!this.token) return false;

    // Verificar que la fecha de expiración exista y sea válida
    if (this.expiry) {
      const expiryDate = new Date(parseInt(this.expiry, 10));
      const isValid = new Date().getTime() < expiryDate.getTime();
      console.log(`Token válido: ${isValid}`);
      return isValid;
    }
    
    // Si no hay expiración pero hay token, lo consideramos válido
    return !!this.token;
  }

  redirectToLogin() {
    if (isClient()) {
      window.location.replace("/");  // Redirige al login
    }
  }

  checkTokenValidity() {
    if (!this.isAuthenticated()) {
      console.log("Token inválido o expirado, redirigiendo al login.");
      this.logout(); // Si no está autenticado, limpiar todo y redirigir al login
    }
  }

  logout() {
    if (isClient()) {
      console.log("Cerrando sesión y eliminando token");
      localStorage.removeItem("token");
      localStorage.removeItem("expiry");
      deleteCookie("token");
      deleteCookie("expiry");
      this.redirectToLogin(); // Redirigir al login
    }
  }

  // Método para renovar token y actualizar tanto en localStorage como en las cookies
  renewToken(newToken, newExpiry) {
    if (isClient()) {
      localStorage.setItem("token", newToken);
      localStorage.setItem("expiry", newExpiry);
      document.cookie = `token=${newToken}; max-age=3600; path=/;`; // Expira en 1 hora
      document.cookie = `expiry=${newExpiry}; max-age=3600; path=/;`; // Expira en 1 hora
    }
  }
}

export default Auth;
