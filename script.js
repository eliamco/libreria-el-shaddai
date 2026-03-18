const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTF8ZcmA7-6-cAV3nCcfsvS15CmOcsqnC5oMHT7TF5NfxqyW_my3EWpuuTNkR3aqiFeI4XhGhfyzxcA/pub?gid=0&single=true&output=csv";

const catalogo = document.getElementById("catalogo");
const buscador = document.getElementById("buscador");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroPrecio = document.getElementById("filtroPrecio");
const valorPrecio = document.getElementById("valorPrecio");
const contador = document.getElementById("contadorResultados");
const paginacion = document.getElementById("paginacion");
const botonFiltro = document.getElementById("botonFiltro");
const panelFiltros = document.getElementById("panelFiltros");
const flechaFiltro = document.getElementById("flechaFiltro");
const volverDesdeLibro = sessionStorage.getItem("volverDesdeLibro") === "true";

const botonMenuMovil = document.getElementById("botonMenuMovil");
const menuLinks = document.getElementById("menuLinks");

const slidesBanner = document.querySelectorAll(".slideBanner");
const puntosSlider = document.querySelectorAll(".puntoSlider");
const btnPrevSlide = document.getElementById("prevSlide");
const btnNextSlide = document.getElementById("nextSlide");

let libros = [];
let librosFiltrados = [];
let paginaActual = 1;
const librosPorPagina = 8;

let slideActual = 0;
let intervaloSlider;

let restaurarScrollPendiente = false;

/* =========================
   FUNCIONES GENERALES
========================= */

function parseCSV(line) {
  return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
}

function limpiar(v) {
  return v ? v.replace(/"/g, "").trim() : "";
}

function convertirPrecio(precioTexto) {
  if (!precioTexto) return 0;

  const limpio = precioTexto
    .replace(/q/gi, "")
    .replace(/,/g, "")
    .trim();

  const numero = parseFloat(limpio);
  return isNaN(numero) ? 0 : numero;
}

function abrirPanelFiltros() {
  if (!panelFiltros || !botonFiltro || !flechaFiltro) return;
  panelFiltros.classList.remove("oculto");
  botonFiltro.classList.add("activo");
  flechaFiltro.classList.add("girada");
}

function cerrarPanelFiltros() {
  if (!panelFiltros || !botonFiltro || !flechaFiltro) return;
  panelFiltros.classList.add("oculto");
  botonFiltro.classList.remove("activo");
  flechaFiltro.classList.remove("girada");
}

function togglePanelFiltros() {
  if (!panelFiltros) return;

  if (panelFiltros.classList.contains("oculto")) {
    abrirPanelFiltros();
  } else {
    cerrarPanelFiltros();
  }
}

function abrirMenuMovil() {
  if (!menuLinks || !botonMenuMovil) return;
  menuLinks.classList.add("abierto");
  document.body.classList.add("menuMovilAbierto");
  botonMenuMovil.innerHTML = "✕";
}

function cerrarMenuMovil() {
  if (!menuLinks || !botonMenuMovil) return;
  menuLinks.classList.remove("abierto");
  document.body.classList.remove("menuMovilAbierto");
  botonMenuMovil.innerHTML = "☰";
}

function toggleMenuMovil() {
  if (!menuLinks) return;

  if (menuLinks.classList.contains("abierto")) {
    cerrarMenuMovil();
  } else {
    abrirMenuMovil();
  }
}

/* =========================
   GUARDAR / RESTAURAR ESTADO
========================= */

function guardarEstadoCatalogo() {
  sessionStorage.setItem("catalogoPaginaActual", paginaActual);
  sessionStorage.setItem("catalogoScrollY", window.scrollY);
  sessionStorage.setItem("catalogoBusqueda", buscador ? buscador.value : "");
  sessionStorage.setItem("catalogoCategoria", filtroCategoria ? filtroCategoria.value : "todas");
  sessionStorage.setItem("catalogoPrecio", filtroPrecio ? filtroPrecio.value : "");
}

function restaurarEstadoCatalogo() {
  if (!volverDesdeLibro) {
    sessionStorage.removeItem("catalogoPaginaActual");
    sessionStorage.removeItem("catalogoScrollY");
    sessionStorage.removeItem("catalogoBusqueda");
    sessionStorage.removeItem("catalogoCategoria");
    sessionStorage.removeItem("catalogoPrecio");
    paginaActual = 1;
    restaurarScrollPendiente = false;
    return;
  }

  const busquedaGuardada = sessionStorage.getItem("catalogoBusqueda");
  const categoriaGuardada = sessionStorage.getItem("catalogoCategoria");
  const precioGuardado = sessionStorage.getItem("catalogoPrecio");
  const paginaGuardada = parseInt(sessionStorage.getItem("catalogoPaginaActual"), 10);
  const scrollGuardado = parseInt(sessionStorage.getItem("catalogoScrollY"), 10);

  if (buscador && busquedaGuardada !== null) {
    buscador.value = busquedaGuardada;
  }

  if (filtroCategoria && categoriaGuardada !== null) {
    filtroCategoria.value = categoriaGuardada;
  }

  if (filtroPrecio && precioGuardado !== null && precioGuardado !== "") {
    filtroPrecio.value = precioGuardado;
    valorPrecio.textContent = `Q ${precioGuardado}`;
  }

  if (!isNaN(paginaGuardada) && paginaGuardada > 0) {
    paginaActual = paginaGuardada;
  } else {
    paginaActual = 1;
  }

  if (!isNaN(scrollGuardado) && scrollGuardado >= 0) {
    restaurarScrollPendiente = true;
  }

  sessionStorage.removeItem("volverDesdeLibro");
}

function aplicarFiltrosSinResetearPagina() {
  const texto = buscador.value.toLowerCase().trim();
  const categoria = filtroCategoria.value;
  const precioMaximo = Number(filtroPrecio.value);

  valorPrecio.textContent = `Q ${precioMaximo}`;

  librosFiltrados = libros.filter(libro => {
    const textoBusqueda = `${libro.titulo} ${libro.autor} ${libro.editorial}`.toLowerCase();

    const coincideBusqueda = textoBusqueda.includes(texto);
    const coincideCategoria = categoria === "todas" || libro.categoria === categoria;
    const coincidePrecio = libro.precioNumero <= precioMaximo;

    return coincideBusqueda && coincideCategoria && coincidePrecio;
  });
}

function restaurarScrollSiHaceFalta() {
  if (!restaurarScrollPendiente) return;

  const scrollGuardado = parseInt(sessionStorage.getItem("catalogoScrollY"), 10);

  if (!isNaN(scrollGuardado) && scrollGuardado >= 0) {
    setTimeout(() => {
      window.scrollTo({
        top: scrollGuardado,
        behavior: "auto"
      });
    }, 120);
  }

  restaurarScrollPendiente = false;
}

/* =========================
   CATEGORÍAS
========================= */

function cargarCategoriasDinamicas() {
  const categoriasUnicas = [...new Set(
    libros
      .map(libro => libro.categoria)
      .filter(categoria => categoria && categoria.trim() !== "")
  )].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

  filtroCategoria.innerHTML = `<option value="todas">Todas las categorías</option>`;

  categoriasUnicas.forEach(categoria => {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    filtroCategoria.appendChild(option);
  });
}

/* =========================
   RENDER CATÁLOGO
========================= */

function mostrarPagina() {
  catalogo.innerHTML = "";

  const totalPaginas = Math.ceil(librosFiltrados.length / librosPorPagina);

  if (paginaActual > totalPaginas && totalPaginas > 0) {
    paginaActual = totalPaginas;
  }

  const inicio = (paginaActual - 1) * librosPorPagina;
  const fin = inicio + librosPorPagina;
  const paginaLibros = librosFiltrados.slice(inicio, fin);

  contador.innerText = `${librosFiltrados.length} libros encontrados`;

  if (paginaLibros.length === 0) {
    catalogo.innerHTML = `
      <div class="sinResultados">
        <h3>No se encontraron libros</h3>
        <p>Prueba con otra búsqueda o cambia los filtros.</p>
      </div>
    `;
    paginacion.innerHTML = "";
    return;
  }

  paginaLibros.forEach(libro => {
    const estado = libro.stock > 0
      ? '<span class="estadoLibro disponible">Disponible</span>'
      : '<span class="estadoLibro agotado">Agotado</span>';

    const precioHTML = libro.precioNumero > 0
      ? `<span class="moneda">GTQ</span><span class="numeroPrecio">${libro.precioNumero}</span>`
      : `<span class="moneda">Consultar</span>`;

    const enlaceLibro = document.createElement("a");
    enlaceLibro.href = `libro.html?id=${libro.id}`;
    enlaceLibro.className = "libro";

    enlaceLibro.addEventListener("click", () => {
      guardarEstadoCatalogo();
      sessionStorage.setItem("volverDesdeLibro", "true");
    });

    enlaceLibro.innerHTML = `
      <div class="contenedorPortada">
        <img src="${libro.imagen}" alt="${libro.titulo}" class="portada" onerror="this.style.display='none'">
      </div>

      <h3>${libro.titulo}</h3>
      <p class="autor">${libro.autor || ""}</p>
      <p class="editorial">${libro.editorial || ""}</p>

      <p class="precio">
        ${precioHTML}
      </p>

      <div class="estadoWrapper">
        ${estado}
      </div>
    `;

    catalogo.appendChild(enlaceLibro);
  });

  crearPaginacion();
  restaurarScrollSiHaceFalta();
}

function crearPaginacion() {
  paginacion.innerHTML = "";

  const totalPaginas = Math.ceil(librosFiltrados.length / librosPorPagina);

  if (totalPaginas <= 1) return;

  const maxPaginasVisibles = 4;

  let inicio = paginaActual - 1;
  let fin = paginaActual + 2;

  if (paginaActual <= 2) {
    inicio = 1;
    fin = maxPaginasVisibles;
  }

  if (paginaActual >= totalPaginas - 1) {
    fin = totalPaginas;
    inicio = totalPaginas - maxPaginasVisibles + 1;
  }

  if (inicio < 1) inicio = 1;
  if (fin > totalPaginas) fin = totalPaginas;

  const btnAnterior = document.createElement("button");
  btnAnterior.innerText = "«";
  btnAnterior.disabled = paginaActual === 1;
  btnAnterior.addEventListener("click", () => {
    if (paginaActual > 1) {
      paginaActual--;
      guardarEstadoCatalogo();
      mostrarPagina();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  paginacion.appendChild(btnAnterior);

  for (let i = inicio; i <= fin; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;

    if (i === paginaActual) {
      btn.classList.add("paginaActiva");
    }

    btn.addEventListener("click", () => {
      paginaActual = i;
      guardarEstadoCatalogo();
      mostrarPagina();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    paginacion.appendChild(btn);
  }

  const btnSiguiente = document.createElement("button");
  btnSiguiente.innerText = "»";
  btnSiguiente.disabled = paginaActual === totalPaginas;
  btnSiguiente.addEventListener("click", () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      guardarEstadoCatalogo();
      mostrarPagina();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  paginacion.appendChild(btnSiguiente);
}

/* =========================
   FILTROS
========================= */

function aplicarFiltros() {
  const texto = buscador.value.toLowerCase().trim();
  const categoria = filtroCategoria.value;
  const precioMaximo = Number(filtroPrecio.value);

  valorPrecio.textContent = `Q ${precioMaximo}`;

  librosFiltrados = libros.filter(libro => {
    const textoBusqueda = `${libro.titulo} ${libro.autor} ${libro.editorial}`.toLowerCase();

    const coincideBusqueda = textoBusqueda.includes(texto);
    const coincideCategoria = categoria === "todas" || libro.categoria === categoria;
    const coincidePrecio = libro.precioNumero <= precioMaximo;

    return coincideBusqueda && coincideCategoria && coincidePrecio;
  });

  paginaActual = 1;
  guardarEstadoCatalogo();
  mostrarPagina();
}

/* =========================
   CARGA DE DATOS
========================= */

fetch(url)
  .then(res => res.text())
  .then(data => {
    const filas = data.split("\n").slice(1);

    libros = filas
      .filter(f => f.trim() !== "")
      .map(fila => {
        const c = parseCSV(fila);

        return {
          id: limpiar(c[0]),
          titulo: limpiar(c[1]),
          autor: limpiar(c[2]),
          editorial: limpiar(c[3]),
          categoria: limpiar(c[4]),
          precio: limpiar(c[5]),
          precioNumero: convertirPrecio(limpiar(c[5])),
          stock: Number(limpiar(c[6])) || 0,
          imagen: limpiar(c[8]),
          descripcion: limpiar(c[24])
        };
      })
      .filter(libro => libro.titulo !== "");

    cargarCategoriasDinamicas();

    const precioMaximo = Math.max(...libros.map(libro => libro.precioNumero), 1000);
    filtroPrecio.max = Math.ceil(precioMaximo / 10) * 10;

    restaurarEstadoCatalogo();

    if (!sessionStorage.getItem("catalogoPrecio")) {
      filtroPrecio.value = filtroPrecio.max;
      valorPrecio.textContent = `Q ${filtroPrecio.value}`;
    }

    aplicarFiltrosSinResetearPagina();
    mostrarPagina();
  })
  .catch(error => {
    console.error("Error al cargar los libros:", error);
    catalogo.innerHTML = "<p style='text-align:center;'>No se pudo cargar el catálogo.</p>";
  });

/* =========================
   EVENTOS FILTROS
========================= */

if (botonFiltro && panelFiltros) {
  botonFiltro.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePanelFiltros();
  });
}

if (panelFiltros) {
  panelFiltros.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

if (buscador) {
  buscador.addEventListener("input", aplicarFiltros);
}

if (filtroCategoria) {
  filtroCategoria.addEventListener("change", aplicarFiltros);
}

if (filtroPrecio) {
  filtroPrecio.addEventListener("input", aplicarFiltros);
}

/* =========================
   CERRAR FILTROS AL TOCAR FUERA
========================= */

document.addEventListener("click", (e) => {
  const clickEnBotonFiltro = e.target.closest("#botonFiltro");
  const clickEnPanelFiltros = e.target.closest("#panelFiltros");
  const clickEnGrupoFiltro = e.target.closest(".grupoFiltroDesplegable");

  if (!clickEnBotonFiltro && !clickEnPanelFiltros && !clickEnGrupoFiltro) {
    cerrarPanelFiltros();
  }
});

/* =========================
   SLIDER PRINCIPAL
========================= */

function mostrarSlide(index) {
  slidesBanner.forEach(slide => slide.classList.remove("activo"));
  puntosSlider.forEach(punto => punto.classList.remove("activo"));

  slidesBanner[index].classList.add("activo");
  puntosSlider[index].classList.add("activo");
  slideActual = index;
}

function siguienteSlide() {
  let nuevoIndice = slideActual + 1;
  if (nuevoIndice >= slidesBanner.length) {
    nuevoIndice = 0;
  }
  mostrarSlide(nuevoIndice);
}

function anteriorSlide() {
  let nuevoIndice = slideActual - 1;
  if (nuevoIndice < 0) {
    nuevoIndice = slidesBanner.length - 1;
  }
  mostrarSlide(nuevoIndice);
}

function iniciarSliderAutomatico() {
  intervaloSlider = setInterval(() => {
    siguienteSlide();
  }, 4500);
}

function reiniciarSliderAutomatico() {
  clearInterval(intervaloSlider);
  iniciarSliderAutomatico();
}

if (btnNextSlide && btnPrevSlide && slidesBanner.length > 0) {
  btnNextSlide.addEventListener("click", () => {
    siguienteSlide();
    reiniciarSliderAutomatico();
  });

  btnPrevSlide.addEventListener("click", () => {
    anteriorSlide();
    reiniciarSliderAutomatico();
  });

  puntosSlider.forEach((punto, index) => {
    punto.addEventListener("click", () => {
      mostrarSlide(index);
      reiniciarSliderAutomatico();
    });
  });

  mostrarSlide(0);
  iniciarSliderAutomatico();
}

/* =========================
   MENÚ MÓVIL
========================= */

if (botonMenuMovil && menuLinks) {
  botonMenuMovil.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenuMovil();
  });

  const enlacesMenu = menuLinks.querySelectorAll("a");

  enlacesMenu.forEach(enlace => {
    enlace.addEventListener("click", () => {
      cerrarMenuMovil();
    });
  });

  menuLinks.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 600) {
      cerrarMenuMovil();
      cerrarPanelFiltros();
    }
  });
}

/* =========================
   CERRAR MENÚ MÓVIL AL TOCAR FUERA
========================= */

document.addEventListener("click", (e) => {
  if (window.innerWidth > 600) return;
  if (!menuLinks || !menuLinks.classList.contains("abierto")) return;

  const clickEnMenu = e.target.closest(".menuCategorias");
  const clickEnBarraFiltros = e.target.closest(".barraFiltrosSticky");
  const clickEnPanelFiltros = e.target.closest("#panelFiltros");
  const clickEnBotonFiltro = e.target.closest("#botonFiltro");

  if (!clickEnMenu && !clickEnBarraFiltros && !clickEnPanelFiltros && !clickEnBotonFiltro) {
    cerrarMenuMovil();
  }
});