// Función para obtener el valor de una cookie por su nombre
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Función para eliminar una cookie
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Clase de autenticación
class Auth {
  constructor() {
    this.token = getCookie("token");  // Obtenemos el token de la cookie
    this.expiry = getCookie("expiry"); // Obtenemos la expiración de la cookie
  }

  // Método que verifica si el token es válido
  isAuthenticated() {
    // Verificamos si hay un token
    if (!this.token) return false;

    // Verificamos la fecha de expiración
    if (this.expiry) {
      const expiryDate = new Date(parseInt(this.expiry, 10));
      const isValid = new Date().getTime() < expiryDate.getTime();
      console.log(`Token válido: ${isValid}`);
      return isValid;
    }

    // Si no hay fecha de expiración pero hay token, lo consideramos válido
    return !!this.token;
  }

  // Redirige al login si no está autenticado
  checkTokenValidity() {
    if (!this.isAuthenticated()) {
      console.log("Token inválido o expirado, redirigiendo al login.");
      this.logout(); // Si no está autenticado, limpiar todo y redirigir al login
    }
  }

  // Redirige al login
  redirectToLogin() {
    console.log("Redirigiendo al login");
    window.location.replace("/");  // Redirige al login
  }

  // Método para cerrar sesión y eliminar el token
  logout() {
    console.log("Cerrando sesión y eliminando token");
    deleteCookie("token");
    deleteCookie("expiry");
    this.redirectToLogin(); // Redirigir al login
  }

  // Método para renovar el token y actualizar tanto el token como la expiración en las cookies
  renewToken(newToken, newExpiry) {
    const expiryDate = new Date(newExpiry).getTime();

    // Almacenar el token en la cookie
    document.cookie = `token=${newToken}; max-age=3600; path=/;`; // El token expira en 1 hora

    // Almacenar la fecha de expiración en la cookie (en formato timestamp)
    document.cookie = `expiry=${expiryDate}; max-age=3600; path=/;`; // La expiración también se guarda en cookies
  }
}

export default Auth;
