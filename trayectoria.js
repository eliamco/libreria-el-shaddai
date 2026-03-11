document.addEventListener("DOMContentLoaded", () => {
  iniciarAnimaciones();
  iniciarScrollSuave();
  iniciarEfectoMenu();
  iniciarEfectoGaleria();
  iniciarMenuMovil();
});

/* =========================
   ANIMACIÓN AL APARECER
========================= */
function iniciarAnimaciones() {
  const elementos = document.querySelectorAll(
    ".heroTrayectoria, .bloqueTrayectoria, .galeriaTrayectoria, .contactoTrayectoria, .beneficiosTienda, .footerCompleto"
  );

  if (!elementos.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visibleTrayectoria");
        }
      });
    },
    { threshold: 0.15 }
  );

  elementos.forEach((elemento) => {
    elemento.classList.add("ocultoTrayectoria");
    observer.observe(elemento);
  });
}

/* =========================
   SCROLL SUAVE
========================= */
function iniciarScrollSuave() {
  const enlacesInternos = document.querySelectorAll('a[href^="#"]');

  enlacesInternos.forEach((enlace) => {
    enlace.addEventListener("click", (e) => {
      const destino = enlace.getAttribute("href");

      if (!destino || destino === "#") return;

      const seccion = document.querySelector(destino);

      if (seccion) {
        e.preventDefault();

        const offset = 90;
        const posicion = seccion.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: posicion,
          behavior: "smooth"
        });
      }
    });
  });
}

/* =========================
   EFECTO MENÚ AL HACER SCROLL
========================= */
function iniciarEfectoMenu() {
  const menu = document.querySelector(".menuCategorias");
  if (!menu) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      menu.classList.add("menuScroll");
    } else {
      menu.classList.remove("menuScroll");
    }
  });
}

/* =========================
   EFECTO GALERÍA
========================= */
function iniciarEfectoGaleria() {
  const imagenesGaleria = document.querySelectorAll(".itemGaleriaTrayectoria img");

  if (!imagenesGaleria.length) return;

  imagenesGaleria.forEach((img) => {
    img.addEventListener("click", () => {
      img.classList.toggle("zoomActiva");
    });
  });
}

/* =========================
   MENÚ MÓVIL
========================= */
function iniciarMenuMovil() {
  const botonMenuMovil = document.getElementById("botonMenuMovil");
  const menuLinks = document.getElementById("menuLinks");

  if (!botonMenuMovil || !menuLinks) return;

  function cerrarMenu() {
    menuLinks.classList.remove("abierto");
    botonMenuMovil.innerHTML = "☰";
  }

  function abrirMenu() {
    menuLinks.classList.add("abierto");
    botonMenuMovil.innerHTML = "✕";
  }

  botonMenuMovil.addEventListener("click", (e) => {
    e.stopPropagation();

    if (menuLinks.classList.contains("abierto")) {
      cerrarMenu();
    } else {
      abrirMenu();
    }
  });

  const enlacesMenu = menuLinks.querySelectorAll("a");
  enlacesMenu.forEach((enlace) => {
    enlace.addEventListener("click", () => {
      cerrarMenu();
    });
  });

  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 600 && menuLinks.classList.contains("abierto")) {
      if (!e.target.closest(".menuCategorias")) {
        cerrarMenu();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 600) {
      cerrarMenu();
    }
  });
}