const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTF8ZcmA7-6-cAV3nCcfsvS15CmOcsqnC5oMHT7TF5NfxqyW_my3EWpuuTNkR3aqiFeI4XhGhfyzxcA/pub?gid=0&single=true&output=csv";

const catalogo = document.getElementById("catalogo");
const buscador = document.getElementById("buscador");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroPrecio = document.getElementById("filtroPrecio");
const valorPrecio = document.getElementById("valorPrecio");
const contador = document.getElementById("contadorResultados");
const paginacion = document.getElementById("paginacion");
const seccionDestacados = document.getElementById("seccionDestacados");
const contenedorDestacados = document.getElementById("destacados");
const botonFiltro = document.getElementById("botonFiltro");
const panelFiltros = document.getElementById("panelFiltros");
const flechaFiltro = document.getElementById("flechaFiltro");

let libros = [];
let librosFiltrados = [];

let paginaActual = 1;
const librosPorPagina = 8;

function parseCSV(line){
    return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
}

function limpiar(v){
    return v ? v.replace(/"/g, "").trim() : "";
}

function convertirPrecio(precioTexto){
    if(!precioTexto) return 0;

    const limpio = precioTexto
        .replace(/q/gi, "")
        .replace(/,/g, "")
        .trim();

    const numero = parseFloat(limpio);
    return isNaN(numero) ? 0 : numero;
}

function cargarCategoriasDinamicas(){
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

function mostrarDestacados(){
    if(!contenedorDestacados || !seccionDestacados) return;

    const destacados = libros
        .filter(libro => libro.destacado === "SI")
        .slice(0, 4);

    if(destacados.length === 0){
        seccionDestacados.classList.add("oculto");
        return;
    }

    seccionDestacados.classList.remove("oculto");
    contenedorDestacados.innerHTML = "";

    destacados.forEach(libro => {
        const estado = libro.stock > 0
            ? '<span class="estadoLibro disponible">Disponible</span>'
            : '<span class="estadoLibro agotado">Agotado</span>';

        contenedorDestacados.innerHTML += `
            <a href="libro.html?id=${libro.id}" class="libro">
                <div class="contenedorPortada">
                    <img src="${libro.imagen}" alt="${libro.titulo}" class="portada" onerror="this.style.display='none'">
                </div>

                <h3>${libro.titulo}</h3>
                <p class="autor">${libro.autor || ""}</p>
                <p class="editorial">${libro.editorial || ""}</p>
                <p class="precio">Q ${libro.precio || ""}</p>

                <div class="estadoWrapper">
                    ${estado}
                </div>
            </a>
        `;
    });
}

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
            descripcion: limpiar(c[24]),
            destacado: limpiar(c[25]).toUpperCase()
        };

    })
    .filter(libro => libro.titulo !== "");

    cargarCategoriasDinamicas();

    const precioMaximo = Math.max(...libros.map(libro => libro.precioNumero), 1000);

    filtroPrecio.max = Math.ceil(precioMaximo / 10) * 10;
    filtroPrecio.value = filtroPrecio.max;
    valorPrecio.textContent = `Q ${filtroPrecio.value}`;

    librosFiltrados = libros;
    mostrarDestacados();
    mostrarPagina();

})
.catch(error => {
    console.error("Error al cargar los libros:", error);
    catalogo.innerHTML = "<p style='text-align:center;'>No se pudo cargar el catálogo.</p>";
});

function mostrarPagina(){

    catalogo.innerHTML = "";

    const inicio = (paginaActual - 1) * librosPorPagina;
    const fin = inicio + librosPorPagina;
    const paginaLibros = librosFiltrados.slice(inicio, fin);

    contador.innerText = `${librosFiltrados.length} libros encontrados`;

    if(paginaLibros.length === 0){
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

        catalogo.innerHTML += `
            <a href="libro.html?id=${libro.id}" class="libro">
                <div class="contenedorPortada">
                    <img src="${libro.imagen}" alt="${libro.titulo}" class="portada" onerror="this.style.display='none'">
                </div>

                <h3>${libro.titulo}</h3>
                <p class="autor">${libro.autor || ""}</p>
                <p class="editorial">${libro.editorial || ""}</p>
                <p class="precio">
                <p class="precio">
                ${libro.precioNumero > 0 
                    ? `<span class="moneda">GTQ</span><span class="numeroPrecio">${libro.precioNumero}</span>` 
                    : `<span class="moneda">Consultar</span>`}
                </p>
                <div class="estadoWrapper">
                    ${estado}
                </div>
            </a>
        `;
    });

    crearPaginacion();
}

function crearPaginacion(){

    paginacion.innerHTML = "";

    const totalPaginas = Math.ceil(librosFiltrados.length / librosPorPagina);

    if(totalPaginas <= 1){
        return;
    }

    const btnAnterior = document.createElement("button");
    btnAnterior.innerText = "«";
    btnAnterior.disabled = paginaActual === 1;
    btnAnterior.addEventListener("click", () => {
        if(paginaActual > 1){
            paginaActual--;
            mostrarPagina();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
    paginacion.appendChild(btnAnterior);

    for(let i = 1; i <= totalPaginas; i++){

        const btn = document.createElement("button");
        btn.innerText = i;

        if(i === paginaActual){
            btn.classList.add("paginaActiva");
        }

        btn.addEventListener("click", () => {
            paginaActual = i;
            mostrarPagina();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        paginacion.appendChild(btn);
    }

    const btnSiguiente = document.createElement("button");
    btnSiguiente.innerText = "»";
    btnSiguiente.disabled = paginaActual === totalPaginas;
    btnSiguiente.addEventListener("click", () => {
        if(paginaActual < totalPaginas){
            paginaActual++;
            mostrarPagina();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
    paginacion.appendChild(btnSiguiente);
}

function aplicarFiltros(){

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
    mostrarPagina();
}

botonFiltro.addEventListener("click", () => {
    panelFiltros.classList.toggle("oculto");
    botonFiltro.classList.toggle("activo");
    flechaFiltro.classList.toggle("girada");
});

document.addEventListener("click", (e) => {
    if(!e.target.closest(".grupoFiltroDesplegable")){
        panelFiltros.classList.add("oculto");
        botonFiltro.classList.remove("activo");
        flechaFiltro.classList.remove("girada");
    }
});

buscador.addEventListener("input", aplicarFiltros);
filtroCategoria.addEventListener("change", aplicarFiltros);
filtroPrecio.addEventListener("input", aplicarFiltros);

/* =========================
   SLIDER PRINCIPAL
========================= */

const slidesBanner = document.querySelectorAll(".slideBanner");
const puntosSlider = document.querySelectorAll(".puntoSlider");
const btnPrevSlide = document.getElementById("prevSlide");
const btnNextSlide = document.getElementById("nextSlide");

let slideActual = 0;
let intervaloSlider;

function mostrarSlide(index){
    slidesBanner.forEach(slide => slide.classList.remove("activo"));
    puntosSlider.forEach(punto => punto.classList.remove("activo"));

    slidesBanner[index].classList.add("activo");
    puntosSlider[index].classList.add("activo");
    slideActual = index;
}

function siguienteSlide(){
    let nuevoIndice = slideActual + 1;
    if(nuevoIndice >= slidesBanner.length){
        nuevoIndice = 0;
    }
    mostrarSlide(nuevoIndice);
}

function anteriorSlide(){
    let nuevoIndice = slideActual - 1;
    if(nuevoIndice < 0){
        nuevoIndice = slidesBanner.length - 1;
    }
    mostrarSlide(nuevoIndice);
}

function iniciarSliderAutomatico(){
    intervaloSlider = setInterval(() => {
        siguienteSlide();
    }, 4500);
}

function reiniciarSliderAutomatico(){
    clearInterval(intervaloSlider);
    iniciarSliderAutomatico();
}

if(btnNextSlide && btnPrevSlide && slidesBanner.length > 0){
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

const botonMenuMovil = document.getElementById("botonMenuMovil");
const menuLinks = document.getElementById("menuLinks");

if(botonMenuMovil && menuLinks){
    botonMenuMovil.addEventListener("click", () => {
        menuLinks.classList.toggle("abierto");

        if(menuLinks.classList.contains("abierto")){
            botonMenuMovil.innerHTML = "✕";
        }else{
            botonMenuMovil.innerHTML = "☰";
        }
    });
}

