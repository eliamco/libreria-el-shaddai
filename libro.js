const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTF8ZcmA7-6-cAV3nCcfsvS15CmOcsqnC5oMHT7TF5NfxqyW_my3EWpuuTNkR3aqiFeI4XhGhfyzxcA/pub?gid=0&single=true&output=csv";

const contenedor = document.getElementById("detalleLibro");
const params = new URLSearchParams(window.location.search);
const idLibro = params.get("id");
const telefono = "50230996688";

/* ---------- FUNCIONES CSV ---------- */

function parseCSV(linea) {
  return linea.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
}

function limpiar(valor) {
  return valor ? valor.replace(/"/g, "").trim() : "";
}

function formatoPrecio(precio) {
  const numero = Number(precio);
  if (!isNaN(numero)) {
    return numero.toLocaleString("es-GT");
  }
  return precio;
}

function nl2br(texto) {
  return texto ? texto.replace(/\n/g, "<br>") : "";
}

function tieneTexto(valor) {
  return typeof valor === "string" && valor.trim() !== "";
}

/* ---------- CONVERTIR LINK DE DRIVE ---------- */

function convertirLinkDrive(urlImagen) {
  if (!tieneTexto(urlImagen)) return "";

  const limpio = urlImagen.trim();

  const match =
    limpio.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    limpio.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (!match) return limpio;

  const fileId = match[1];

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
}

/* ---------- CAMBIAR IMAGEN PRINCIPAL ---------- */

function cambiarImagen(src, thumb) {
  const imagenPrincipal = document.getElementById("imagenPrincipalLibro");
  if (!imagenPrincipal || !src) return;

  imagenPrincipal.src = src;

  document.querySelectorAll(".miniaturaItem").forEach(item => {
    item.classList.remove("activa");
  });

  if (thumb) {
    thumb.classList.add("activa");
  }
}

/* ---------- CARGAR DATOS ---------- */

fetch(url)
  .then(res => res.text())
  .then(data => {
    const filas = data.split("\n").slice(1);

    const libros = filas
      .map(fila => {
        const c = parseCSV(fila);

        return {
          id: limpiar(c[0]),
          titulo: limpiar(c[1]),
          autor: limpiar(c[2]),
          editorial: limpiar(c[3]),
          categoria: limpiar(c[4]),
          precio: limpiar(c[5]),
          stock: Number(limpiar(c[6])),
          imagen: limpiar(c[8]),
          descripcion: limpiar(c[9]),
          imagen2: limpiar(c[10]),
          imagen3: limpiar(c[11]),
          isbn: limpiar(c[12]),
          dimensiones: limpiar(c[13]),
          peso: limpiar(c[14]),
          cubierta: limpiar(c[15]),
          paginas: limpiar(c[16]),
          idioma: limpiar(c[17]),
          version: limpiar(c[18]),
          tipoBiblia: limpiar(c[19]),
          tamanoBiblia: limpiar(c[20]),
          caracteristicas: limpiar(c[21]),
          tipoImpresion: limpiar(c[22]),
          descripcionLarga: limpiar(c[23]),
          sobreAutor: limpiar(c[24])
        };
      })
      .filter(libro => libro.titulo !== "");

    const libro = libros.find(l => l.id === idLibro);

    if (!libro) {
      contenedor.innerHTML = `
        <div class="libroNoEncontrado">
          <h2>Libro no encontrado</h2>
          <p>No pudimos encontrar ese producto en el catálogo.</p>
          <a href="index.html" class="botonVolverInterno">Volver al catálogo</a>
        </div>
      `;
      return;
    }

    mostrarLibro(libro);
    mostrarRelacionados(libros, libro);
  })
  .catch(() => {
    contenedor.innerHTML = `
      <div class="libroNoEncontrado">
        <h2>Error al cargar</h2>
        <p>No se pudieron obtener los datos del catálogo.</p>
      </div>
    `;
  });

/* ---------- ARMAR DETALLES TÉCNICOS ---------- */

function construirDetallesTecnicos(libro, disponible) {
  const detalles = [
    { label: "Autor", valor: libro.autor || "No especificado" },
    { label: "Editorial", valor: libro.editorial || "No especificada" },
    { label: "Categoría", valor: libro.categoria || "General" },
    { label: "Disponibilidad", valor: disponible ? "En stock" : "Sin existencias" },
    { label: "ISBN", valor: libro.isbn },
    { label: "Dimensiones", valor: libro.dimensiones },
    { label: "Peso", valor: libro.peso },
    { label: "Cubierta", valor: libro.cubierta },
    { label: "Número de páginas", valor: libro.paginas },
    { label: "Idioma", valor: libro.idioma },
    { label: "Versión", valor: libro.version },
    { label: "Tipo de Biblia", valor: libro.tipoBiblia },
    { label: "Tamaño de Biblia", valor: libro.tamanoBiblia },
    { label: "Tipo de impresión", valor: libro.tipoImpresion }
  ];

  return detalles
    .filter(item => tieneTexto(item.valor))
    .map(item => `
      <div class="itemDetalleProducto">
        <span class="labelDetalle">${item.label}</span>
        <span class="valorDetalle">${item.valor}</span>
      </div>
    `)
    .join("");
}

/* ---------- BLOQUES EXTRA ---------- */

function construirBloqueInfo(titulo, contenido) {
  if (!tieneTexto(contenido)) return "";

  return `
    <section class="bloqueInfoExtra">
      <h2>${titulo}</h2>
      <div class="detalleDescripcionNueva">
        <p>${nl2br(contenido)}</p>
      </div>
    </section>
  `;
}

/* ---------- MOSTRAR LIBRO ---------- */

function mostrarLibro(libro) {
  const disponible = libro.stock > 0;

  const estado = disponible
    ? `<span class="estadoLibro disponible">● Disponible</span>`
    : `<span class="estadoLibro agotado">● Agotado</span>`;

  const mensaje = encodeURIComponent(`Hola, quiero ordenar el libro: ${libro.titulo}`);
  const whatsapp = `https://wa.me/${telefono}?text=${mensaje}`;

  const imagenPrincipal = tieneTexto(libro.imagen)
    ? convertirLinkDrive(libro.imagen)
    : "https://via.placeholder.com/500x700?text=Sin+imagen";

  const imagenesReales = [libro.imagen, libro.imagen2, libro.imagen3]
    .filter(img => tieneTexto(img))
    .map(img => convertirLinkDrive(img));

  let miniaturasHTML = "";

  if (imagenesReales.length > 0) {
    imagenesReales.forEach((img, index) => {
      miniaturasHTML += `
        <button
          class="miniaturaItem ${index === 0 ? "activa" : ""}"
          onclick="cambiarImagen('${img}', this)"
          type="button"
        >
          <img
            src="${img}"
            alt="Vista ${index + 1} de ${libro.titulo}"
            loading="lazy"
            decoding="async"
          >
        </button>
      `;
    });
  }

  const faltantes = 3 - imagenesReales.length;

  for (let i = 0; i < faltantes; i++) {
    miniaturasHTML += `
      <div class="miniaturaItem miniaturaVacia">
        <span>+</span>
        <small>Imagen extra</small>
      </div>
    `;
  }

  const detallesTecnicosHTML = construirDetallesTecnicos(libro, disponible);

  const bloqueDescripcion = construirBloqueInfo(
    "Descripción",
    libro.descripcion || "Este libro no tiene descripción disponible por el momento."
  );

  const bloqueCaracteristicas = construirBloqueInfo(
    "Características adicionales",
    libro.caracteristicas
  );

  const bloqueDescripcionLarga = construirBloqueInfo(
    "Descripción detallada",
    libro.descripcionLarga
  );

  const bloqueAutor = construirBloqueInfo(
    "Sobre el autor",
    libro.sobreAutor
  );

  function construirTarjetaCompra(claseExtra = "") {
    return `
      <div class="tarjetaCompra ${claseExtra}">
        <div class="encabezadoProducto">
          <p class="categoriaSuperior">${libro.categoria || "Libro"}</p>
          <h1>${libro.titulo}</h1>
          <p class="subInfoProducto"><strong>Autor:</strong> ${libro.autor || "No especificado"}</p>
          <p class="subInfoProducto"><strong>Editorial:</strong> ${libro.editorial || "No especificada"}</p>
        </div>

        <div class="precioEstadoWrap">

        <p class="detallePrecioNuevo">
        ${Number(libro.precio) > 0
          ? `<span class="moneda">GTQ</span><span class="numeroPrecio">${formatoPrecio(libro.precio)}</span>`
          : `<span class="moneda">Consultar</span>`
        }
        </p>

        ${estado}

        </div>

        <div class="cajaEnvio">
          <p>🚚 <strong>Entrega estimada:</strong> 2 a 3 días hábiles con Cargo Expreso</p>
        </div>

        <a href="${whatsapp}" target="_blank" class="botonComprarNuevo">
          <span class="iconoBoton">🟢</span>
          <span>Ordenar por WhatsApp</span>
        </a>

        <div class="metodosPagoNuevo">
          <h3>Métodos de pago</h3>
          <p>💵 Pago contra entrega</p>
          <p>🏦 Transferencia bancaria</p>
        </div>
      </div>
    `;
  }

  contenedor.innerHTML = `
    <section class="detalleLibroNuevo">
      <div class="columnaPrincipalIzquierda">
        <div class="columnaGaleria">
          <div class="galeriaLibro">
            <div class="miniaturasColumna">
              ${miniaturasHTML}
            </div>

            <div class="imagenPrincipalWrap">
              <img
                id="imagenPrincipalLibro"
                src="${imagenPrincipal}"
                alt="${libro.titulo}"
                class="imagenPrincipalLibro"
                loading="eager"
                decoding="sync"
              >
            </div>
          </div>
        </div>

        ${construirTarjetaCompra("tarjetaCompraMovil")}

        <div class="zonaInformacionExtra">
          ${bloqueDescripcion}
          ${bloqueCaracteristicas}
          ${bloqueDescripcionLarga}
          ${bloqueAutor}
        </div>
      </div>

      <div class="columnaInfo">
        ${construirTarjetaCompra("tarjetaCompraDesktop")}

        <div class="bloqueDetallesProducto">
          <h3>Detalles del producto</h3>
          <div class="gridDetallesProducto">
            ${detallesTecnicosHTML}
          </div>
        </div>
      </div>
    </section>

    <a href="https://wa.me/${telefono}" target="_blank" class="whatsappFlotante" aria-label="WhatsApp">
      <img
        src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
        class="iconoWhats"
        alt="WhatsApp"
        loading="lazy"
        decoding="async"
      >
    </a>
  `;

  const imgPrincipal = document.getElementById("imagenPrincipalLibro");

  if (imgPrincipal) {
    imgPrincipal.onload = function () {
      console.log("src:", this.src);
      console.log("naturalWidth:", this.naturalWidth);
      console.log("naturalHeight:", this.naturalHeight);
      console.log("clientWidth:", this.clientWidth);
      console.log("clientHeight:", this.clientHeight);
    };

    imgPrincipal.onerror = function () {
      console.log("Error al cargar la imagen principal:", this.src);
    };
  }
}

/* ---------- LIBROS RELACIONADOS ---------- */

function mostrarRelacionados(libros, libro) {
  const relacionados = libros
    .filter(l => l.categoria === libro.categoria && l.id !== libro.id && l.titulo !== "")
    .slice(0, 4);

  if (relacionados.length === 0) return;

  let html = `
    <section class="seccionRelacionados">
      <h2>Libros relacionados</h2>
      <div class="relacionadosGrid">
  `;

  relacionados.forEach(r => {
    const estado = r.stock > 0
      ? `<span class="estadoMini disponible">Disponible</span>`
      : `<span class="estadoMini agotado">Agotado</span>`;

    const imagenRelacionado = tieneTexto(r.imagen)
      ? convertirLinkDrive(r.imagen)
      : "https://via.placeholder.com/200x300?text=Sin+imagen";

    html += `
      <a href="libro.html?id=${r.id}" class="relacionadoCard">
        <div class="relacionadoImagenWrap">
          <img
            src="${imagenRelacionado}"
            class="miniPortada"
            alt="${r.titulo}"
            loading="lazy"
            decoding="async"
          >
        </div>
        <div class="relacionadoInfo">
          <p class="relacionadoTitulo">${r.titulo}</p>
          <p class="relacionadoAutor">${r.autor || "Autor no especificado"}</p>
          <p class="relacionadoPrecio">Q ${formatoPrecio(r.precio)}</p>
          ${estado}
        </div>
      </a>
    `;
  });

  html += `
      </div>
    </section>
  `;

  contenedor.innerHTML += html;
}

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