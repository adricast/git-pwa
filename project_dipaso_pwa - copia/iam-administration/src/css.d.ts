// Declara un módulo para archivos .sass que terminen en .module.sass
declare module '*.module.sass' {
  // Define que el objeto importado (e.g., 'styles' en el componente) 
  // es un objeto de tipo Record<string, string>.
  // Esto significa que cualquier clave de string (el nombre de tu clase SCSS) 
  // tendrá un valor de string (el nombre de la clase generado por el módulo).
  const classes: { [key: string]: string };
  export default classes;
}

// Opcional: Si usas otros formatos de módulos CSS
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}