class Auth {
    constructor() {
      this.token = localStorage.getItem("token");
      this.expiry = localStorage.getItem("expiry");
      this.profilePicture = localStorage.getItem("profilePicture");
    }
  
    isAuthenticated() {
      const expiry = new Date(parseInt(this.expiry, 10));
      console.log(expiry);
      return this.token && this.expiry && new Date().getTime() < expiry;
    }
  
    redirectToApp() {
      window.location.href = "/fcaSpace"; // Redireccionar a la página de login
    }
  
    checkTokenValidity() {
      if (this.isAuthenticated()) {
        this.redirectToApp();
      }
    }
  
    redirectToSite() {
      window.location.href = "/fcaSpace";
    }
  }
  
  export default Auth;
  