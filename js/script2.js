
  // SOLO BUSCARÁ EL BOTÓN SI ESTÁ DENTRO DE ESTA PÁGINA
  /* ... const page = document.getElementById("texto");

  if (page) {
    const button = page.querySelector("#toggleBtn");
    let visible = false;

    button.addEventListener("click", () => {
      const spans = page.querySelectorAll("#sufijo_14");
      visible = !visible;

      spans.forEach(span => {
        span.style.display = visible ? "inline" : "none";
      });

      button.textContent = visible ? "Ocultar traducción" : "Mostrar traducción";
    });
  }*/

    document.addEventListener("DOMContentLoaded", () => {
  const page = document.getElementById("texto");

  if (!page) return;

  const button = document.getElementById("toggleBtn");
  const spans = page.querySelectorAll("#sufijo_14");

  if (!button) return;

  let visible = false;

  // Al cargar la página, la traducción queda oculta
  spans.forEach(span => {
    span.style.display = "none";
  });

  button.textContent = "Mostrar traducción";

  button.addEventListener("click", () => {
    visible = !visible;

    spans.forEach(span => {
      span.style.display = visible ? "inline" : "none";
    });

    button.textContent = visible
      ? "Ocultar traducción"
      : "Mostrar traducción";
  });
});
