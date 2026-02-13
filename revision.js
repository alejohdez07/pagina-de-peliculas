//---------variables globales----------//
let USUARIO = {
    admin: "admin123",
    usuario: "1234",
    demo: "demo"
};

let usuarioActual = null;
let peliculasglobales = [];
let peliculaEditandoId = null;

//------inicializacion de app---//
document.addEventListener("DOMContentLoaded", () => {
    inicializarApp(); //cargar aplicacion
    eventos(); //cargar evento
});

function cargarUsuarioRegistrado() {
    // obtener usuario de localstorage y agregar a la validacion usuario
    let usuarioRegistrado = JSON.parse(localStorage.getItem("usuarioRegistrado"));
    if (usuarioRegistrado) {
        Object.assign(USUARIO, usuarioRegistrado);
    }
}

//===== eventos del usuario ====//
function eventos() {
    //boton login
    document.querySelector("#formLogin").addEventListener("submit", login);
    //boton logout
    document.querySelector("#btnLogout").addEventListener("click", logout);
    //boton registro
    document.querySelector("#formRegistro").addEventListener("submit", registro);
    //link para volver al login
    document.querySelector("#linkLogin").addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelector("#login-tab").click();
    });
    
    // Eventos de búsqueda y filtro
    document.querySelector("#inputBuscar").addEventListener("input", filtrarPeliculas);
    document.querySelector("#selectGenero").addEventListener("change", filtrarPeliculas);
    
    // Evento guardar película
    document.querySelector("#btnGuardarPelicula").addEventListener("click", guardarPelicula);

    // Limpiar formulario al abrir modal de agregar
    document.querySelector("#btnAgregar").addEventListener("click", () => {
        peliculaEditandoId = null;
        document.querySelector("#modalTitulo").textContent = "Agregar Película";
        document.querySelector("#formPelicula").reset();
    });
}

function inicializarApp() {
    ///cargar usuario registrado en localstorage
    cargarUsuarioRegistrado();

    //verificar si hay una usuario logeado
    let userlogged = localStorage.getItem("usuariologueado");
    if (userlogged) {
        usuarioActual = JSON.parse(userlogged);
        mostrarDashboard();
    }

    // Sincronizar películas de ejemplo (agrega faltantes sin borrar las existentes)
    sincronizarPeliculasEjemplo();
}

function login(e) {
    e.preventDefault();
    let user = document.getElementById("inputUser").value;
    let password = document.getElementById("inputPassword").value;

    if (USUARIO[user] && USUARIO[user] === password) {
        usuarioActual = user;
        localStorage.setItem("usuariologueado", JSON.stringify(user))
        mostrarDashboard();
        document.querySelector("#formLogin").reset();
    } else {
        alert("El usuario y contraseña no son válidos")
    }
}

function mostrarDashboard() {
    document.querySelector("#loginSection").style.display = "none";
    document.querySelector("#btnLogin").style.display = "none";
    document.querySelector("#dashboard").style.display = "block";
    document.querySelector("#btnLogout").style.display = "block";
    document.querySelector("#btnAgregar").style.display = "block";
    //cargar peliculas
    cargarPeliculas();
}

function mostrarLogin() {
    document.querySelector("#loginSection").style.display = "flex";
    document.querySelector("#btnLogin").style.display = "block";
    document.querySelector("#dashboard").style.display = "none";
    document.querySelector("#btnLogout").style.display = "none";
    document.querySelector("#btnAgregar").style.display = "none";
}

function logout() {
    let confirmar = confirm("¿Deseas cerrar sesión?");
    if (confirmar) {
        usuarioActual = null;
        localStorage.removeItem("usuariologueado")
        mostrarLogin();
        document.querySelector("#formLogin").reset();
    }
}

function registro(e) {
    e.preventDefault();
    let nombre = document.querySelector("#inputNombre").value.trim();
    let email = document.querySelector("#inputEmail").value.trim();
    let usuario = document.querySelector("#inputUserReg").value.trim();
    let password = document.querySelector("#inputPasswordReg").value.trim();
    let confirmpassword = document.querySelector("#inputConfirmPassword").value.trim();

    //validaciones
    if (!nombre || !email || !usuario || !password || !confirmpassword) {
        alert("Por favor completa todos los campos");
        return;
    }

    if (usuario.length < 4) {
        alert("El usuario debe contener mínimo 4 caracteres")
        return;
    }

    if (password.length < 6) {
        alert("La contraseña debe contener mínimo 6 caracteres");
        return;
    }

    if (password !== confirmpassword) {
        alert("Las contraseñas no coinciden");
        return;
    }

    if (USUARIO[usuario]) {
        alert("El usuario ya existe, elige otro")
        return;
    }

    USUARIO[usuario] = password; // agregar usuario a la lista
    //guardar en localstorage
    let usuarioRegistrado = JSON.parse(localStorage.getItem("usuarioRegistrado")) || {};
    usuarioRegistrado[usuario] = password;
    localStorage.setItem("usuarioRegistrado", JSON.stringify(usuarioRegistrado));

    //exito
    alert("Usuario " + usuario + " registrado con éxito 🤪");

    //limpiar formulario de registro
    document.querySelector("#formRegistro").reset();
    document.querySelector("#login-tab").click();
}

// peliculas de ejemplo
function cargarDatosEjemplo(){
    let peliculasEjemplo = obtenerPeliculasEjemplo();
    
    //guardar en localstorage
    localStorage.setItem("peliculas", JSON.stringify(peliculasEjemplo));
}

function sincronizarPeliculasEjemplo() {
    let peliculasGuardadas = JSON.parse(localStorage.getItem("peliculas")) || [];
    let peliculasEjemplo = obtenerPeliculasEjemplo();

    if (!Array.isArray(peliculasGuardadas) || peliculasGuardadas.length === 0) {
        localStorage.setItem("peliculas", JSON.stringify(peliculasEjemplo));
        return;
    }

    let idsGuardados = new Set(peliculasGuardadas.map(p => p.id));
    let peliculasFaltantes = peliculasEjemplo.filter(p => !idsGuardados.has(p.id));

    if (peliculasFaltantes.length > 0) {
        let peliculasActualizadas = [...peliculasGuardadas, ...peliculasFaltantes];
        localStorage.setItem("peliculas", JSON.stringify(peliculasActualizadas));
    }
}

function obtenerPeliculasEjemplo() {
    return [
        {
            id: 1,
            titulo: "Avatar: El Camino del Agua",
            genero: "Ciencia Ficción",
            director: "James Cameron",
            ano: 2022,
            calificacion: 9.2,
            descripcion: "Jake Sully y Neytiri han formado una familia y están decididos a permanecer juntos. Sin embargo, deben abandonar su hogar y explorar las regiones de Pandora, realizando una alianza con los clanes de los arrecifes para proteger a su familia.",
            imagen: "https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFlNzAtNTVhNzM1YjI1NzMxXkEyXkFqcGdeQXVyMjQxNTE1MDA@._V1_.jpg",
            fecha: new Date().toISOString()
        },
        {
            id: 2,
            titulo: "Inception",
            genero: "Ciencia Ficción",
            director: "Christopher Nolan",
            ano: 2010,
            calificacion: 9.3,
            descripcion: "Dom Cobb es un ladrón especializado en extraer secretos del subconsciente durante el estado de sueño. Su habilidad lo ha convertido en un fugitivo y ha sacrificado todo lo que ama. Ahora tiene la oportunidad de redimirse realizando una última misión: la Inception, plantar una idea en la mente de alguien.",
            imagen: "https://image.tmdb.org/t/p/original/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
            fecha: new Date().toISOString()
        },
        {
            id: 3,
            titulo: "Spider-Man: No Way Home",
            genero: "Acción",
            director: "Jon Watts",
            ano: 2021,
            calificacion: 9.0,
            descripcion: "Peter Parker busca la ayuda del Doctor Strange para restaurar su identidad secreta. Sin embargo, el hechizo provoca una grieta en el multiverso trayendo visitantes de otras realidades alternativas.",
            imagen: "https://m.media-amazon.com/images/M/MV5BZWMyYzFjYTYtNTRjYi00OGExLWE2YzgtOGRmYjAxZTU3NzBiXkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_.jpg",
            fecha: new Date().toISOString()
        },
        {
            id: 4,
            titulo: "Interstellar",
            genero: "Ciencia Ficción",
            director: "Christopher Nolan",
            ano: 2014,
            calificacion: 9.4,
            descripcion: "Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento de garantizar la supervivencia de la humanidad. Una épica aventura sobre el amor, el tiempo y el sacrificio.",
            imagen: "https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
            fecha: new Date().toISOString()
        },
        {
            id: 5,
            titulo: "Pulp Fiction",
            genero: "Drama",
            director: "Quentin Tarantino",
            ano: 1994,
            calificacion: 9.5,
            descripcion: "Las vidas de dos sicarios, un boxeador, la esposa de un gánster y dos bandidos se entrelazan en cuatro historias de violencia y redención. Una obra maestra del cine moderno llena de diálogos inolvidables.",
            imagen: "https://image.tmdb.org/t/p/original/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
            fecha: new Date().toISOString()
        },
        {
            id: 6,
            titulo: "El Señor de los Anillos: El Retorno del Rey",
            genero: "Aventura",
            director: "Peter Jackson",
            ano: 2003,
            calificacion: 9.6,
            descripcion: "Gandalf y Aragorn lideran el Mundo de los Hombres contra el ejército de Sauron para distraer su atención de Frodo y Sam mientras se acercan al Monte del Destino con el Anillo Único. La épica conclusión de la trilogía.",
            imagen: "https://image.tmdb.org/t/p/original/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
            fecha: new Date().toISOString()
        },
        {
            id: 7,
            titulo: "Forrest Gump",
            genero: "Drama",
            director: "Robert Zemeckis",
            ano: 1994,
            calificacion: 9.3,
            descripcion: "La vida de Forrest Gump, un hombre con bajo coeficiente intelectual, quien sin querer se convierte en inspiración para millones. Una emotiva historia que atraviesa décadas de historia estadounidense con humor y corazón.",
            imagen: "https://image.tmdb.org/t/p/original/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
            fecha: new Date().toISOString()
        },
        {
            id: 8,
            titulo: "The Dark Knight",
            genero: "Acción",
            director: "Christopher Nolan",
            ano: 2008,
            calificacion: 9.4,
            descripcion: "Batman debe enfrentar al Joker, un criminal impredecible que lleva el caos a Gotham y obliga al héroe a cuestionar sus límites.",
            imagen: "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
            fecha: new Date().toISOString()
        },
        {
            id: 9,
            titulo: "Parasite",
            genero: "Drama",
            director: "Bong Joon-ho",
            ano: 2019,
            calificacion: 9.1,
            descripcion: "La familia Kim se infiltra en la vida de una adinerada familia de Seúl, desencadenando una historia brillante de tensión y crítica social.",
            imagen: "https://image.tmdb.org/t/p/original/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
            fecha: new Date().toISOString()
        },
        {
            id: 10,
            titulo: "Coco",
            genero: "Aventura",
            director: "Lee Unkrich",
            ano: 2017,
            calificacion: 9.0,
            descripcion: "Miguel viaja al mundo de los muertos para descubrir la verdad de su familia y el valor de recordar a quienes amamos.",
            imagen: "https://image.tmdb.org/t/p/original/6Ryitt95xrO8KXuqRGm1fUuNwqF.jpg",
            fecha: new Date().toISOString()
        },
        {
            id: 11,
            titulo: "Gladiator",
            genero: "Acción",
            director: "Ridley Scott",
            ano: 2000,
            calificacion: 9.0,
            descripcion: "Un general romano traicionado se convierte en gladiador para vengar a su familia y devolver el honor al imperio.",
            imagen: "https://image.tmdb.org/t/p/original/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
            fecha: new Date().toISOString()
        },
        {
            id: 12,
            titulo: "Your Name",
            genero: "Drama",
            director: "Makoto Shinkai",
            ano: 2016,
            calificacion: 8.9,
            descripcion: "Dos adolescentes intercambian cuerpos misteriosamente y crean un vínculo inesperado que desafía el tiempo y la distancia.",
            imagen: "https://image.tmdb.org/t/p/original/q719jXXEzOoYaps6babgKnONONX.jpg",
            fecha: new Date().toISOString()
        }
    ];
}

//--------cargar peliculas ----
function cargarPeliculas() {
    let peliculas = localStorage.getItem("peliculas");
    peliculasglobales = peliculas ? JSON.parse(peliculas) : [];
    renderizarGrid(peliculasglobales);
    renderizarSlider(peliculasglobales);
}   

function renderizarGrid(pelis){
    let grid = document.querySelector("#gridPeliculas");
    let sinResultados = document.querySelector("#sinResultados");

    if (pelis.length === 0){
        grid.innerHTML = "";
        sinResultados.style.display = "block";
        return;
    }

    sinResultados.style.display = "none";
    grid.innerHTML = pelis.map(p => 
        `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="movie-card">
                <img src="${p.imagen}" class="movie-image" alt="${p.titulo}" onerror="this.src='https://static.vecteezy.com/system/resources/previews/025/952/885/original/error-icon-design-free-vector.jpg'">
                <div class="movie-content">
                    <h5 class="movie-title">${p.titulo}</h5>
                    <span class="movie-genre">${p.genero}</span>
                    <div class="movie-meta"><b>${p.ano}</b> - ${p.director}</div>
                    <div class="movie-rating">⭐${p.calificacion}</div>
                    <div class="movie-description">${p.descripcion}</div>
                    <div class="movie-actions">
                        <button class="btn btn-info btn-sm" onclick="verDetalles(${p.id})">Ver Detalles</button>
                        <button class="btn btn-warning btn-sm" onclick="editarPelicula(${p.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarPelicula(${p.id})">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
        `
    ).join("");
}

function renderizarSlider(pelis) {
    let carousel = document.querySelector("#carouselMovies");
    
    if (pelis.length === 0) {
        carousel.innerHTML = '<p class="text-white">No hay películas disponibles</p>';
        return;
    }
    
    // Mostrar las 6 películas más recientes
    let peliculasRecientes = pelis.slice(0, 6);
    
    carousel.innerHTML = peliculasRecientes.map(p => 
        `
        <div class="slider-movie-card" onclick="verDetalles(${p.id})">
            <img src="${p.imagen}" alt="${p.titulo}" onerror="this.src='https://static.vecteezy.com/system/resources/previews/025/952/885/original/error-icon-design-free-vector.jpg'">
            <div class="slider-movie-info">
                <h6>${p.titulo}</h6>
            </div>
        </div>
        `
    ).join("");
}

function scrollSlider(direction) {
    const carousel = document.querySelector("#carouselMovies");
    const scrollAmount = 200;
    carousel.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

function filtrarPeliculas() {
    let busqueda = document.querySelector("#inputBuscar").value.toLowerCase();
    let genero = document.querySelector("#selectGenero").value;
    
    let peliculasFiltradas = peliculasglobales.filter(p => {
        let coincideBusqueda = p.titulo.toLowerCase().includes(busqueda) ||
                               p.director.toLowerCase().includes(busqueda) ||
                               p.descripcion.toLowerCase().includes(busqueda);
        let coincideGenero = !genero || p.genero === genero;
        
        return coincideBusqueda && coincideGenero;
    });
    
    renderizarGrid(peliculasFiltradas);
}

function verDetalles(id) {
    let pelicula = peliculasglobales.find(p => p.id === id);
    if (!pelicula) return;
    
    document.querySelector("#detallesTitulo").textContent = pelicula.titulo;
    document.querySelector("#detallesImagen").src = pelicula.imagen;
    document.querySelector("#detallesGenero").textContent = pelicula.genero;
    document.querySelector("#detallesDirector").textContent = pelicula.director;
    document.querySelector("#detallesAno").textContent = pelicula.ano;
    document.querySelector("#detallesCalificacion").textContent = pelicula.calificacion;
    document.querySelector("#detallesDescripcion").textContent = pelicula.descripcion;
    
    let modal = new bootstrap.Modal(document.querySelector("#modalDetalles"));
    modal.show();
}

function editarPelicula(id) {
    let pelicula = peliculasglobales.find(p => p.id === id);
    if (!pelicula) return;
    
    peliculaEditandoId = id;
    
    document.querySelector("#modalTitulo").textContent = "Editar Película";
    document.querySelector("#inputTitulo").value = pelicula.titulo;
    document.querySelector("#inputGenero").value = pelicula.genero;
    document.querySelector("#inputDirector").value = pelicula.director;
    document.querySelector("#inputAno").value = pelicula.ano;
    document.querySelector("#inputCalificacion").value = pelicula.calificacion;
    document.querySelector("#inputDescripcion").value = pelicula.descripcion;
    document.querySelector("#inputImagen").value = pelicula.imagen;
    
    let modal = new bootstrap.Modal(document.querySelector("#modalPelicula"));
    modal.show();
}

function eliminarPelicula(id) {
    if (!confirm("¿Estás seguro de eliminar esta película?")) return;
    
    peliculasglobales = peliculasglobales.filter(p => p.id !== id);
    localStorage.setItem("peliculas", JSON.stringify(peliculasglobales));
    cargarPeliculas();
    alert("Película eliminada correctamente");
}

function guardarPelicula() {
    let titulo = document.querySelector("#inputTitulo").value.trim();
    let genero = document.querySelector("#inputGenero").value;
    let director = document.querySelector("#inputDirector").value.trim();
    let ano = parseInt(document.querySelector("#inputAno").value);
    let calificacion = parseFloat(document.querySelector("#inputCalificacion").value);
    let descripcion = document.querySelector("#inputDescripcion").value.trim();
    let imagen = document.querySelector("#inputImagen").value.trim();
    
    if (!titulo || !genero || !director || !ano || !calificacion) {
        alert("Por favor completa los campos obligatorios: título, género, director, año y calificación");
        return;
    }

    if (!descripcion) {
        descripcion = "Sin descripción disponible.";
    }

    if (!imagen) {
        imagen = "https://static.vecteezy.com/system/resources/previews/025/952/885/original/error-icon-design-free-vector.jpg";
    }
    
    if (peliculaEditandoId) {
        // Editar película existente
        let index = peliculasglobales.findIndex(p => p.id === peliculaEditandoId);
        peliculasglobales[index] = {
            id: peliculaEditandoId,
            titulo,
            genero,
            director,
            ano,
            calificacion,
            descripcion,
            imagen,
            fecha: peliculasglobales[index].fecha
        };
        alert("Película actualizada correctamente");
    } else {
        // Agregar nueva película
        let nuevoId = peliculasglobales.length > 0 
            ? Math.max(...peliculasglobales.map(p => p.id)) + 1 
            : 1;
        
        let nuevaPelicula = {
            id: nuevoId,
            titulo,
            genero,
            director,
            ano,
            calificacion,
            descripcion,
            imagen,
            fecha: new Date().toISOString()
        };
        
        peliculasglobales.push(nuevaPelicula);
        alert("Película agregada correctamente");
    }
    
    localStorage.setItem("peliculas", JSON.stringify(peliculasglobales));
    cargarPeliculas();
    
    // Limpiar formulario y cerrar modal
    document.querySelector("#formPelicula").reset();
    peliculaEditandoId = null;
    document.querySelector("#modalTitulo").textContent = "Agregar Película";
    
    let modal = bootstrap.Modal.getInstance(document.querySelector("#modalPelicula"));
    modal.hide();
}
