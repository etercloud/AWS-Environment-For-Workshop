document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const views = document.querySelectorAll('.view');
    const navLinks = document.querySelectorAll('nav a');
    const homeLink = document.getElementById('home-link');
    const searchLink = document.getElementById('search-link');
    const aboutLink = document.getElementById('about-link');

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResultsContainer = document.getElementById('search-results');

    // --- API Endpoint para cargar TODOS los animales ---
    // Este endpoint debe devolver el contenido completo de 'animales.txt'
    const ALL_ANIMALS_ENDPOINT = '/api/animales.php?url=file:///animales.txt'; // ¡ASEGÚRATE DE QUE ESTE SCRIPT PHP EXISTA Y FUNCIONE!

    // --- Variables para almacenar los datos y el estado de carga ---
    let todosLosAnimales = []; // Aquí guardaremos todos los nombres de los animales
    let datosCargados = false;
    let errorAlCargarDatos = null;

    // --- Función para cargar todos los animales desde el endpoint ---
    async function cargarTodosLosAnimales() {
        try {
            const response = await fetch(ALL_ANIMALS_ENDPOINT);
            if (!response.ok) {
                throw new Error(`Error al cargar la lista de animales: ${response.status} ${response.statusText}. Endpoint: ${ALL_ANIMALS_ENDPOINT}`);
            }
            const responseText = await response.text();
            
            // Procesar el texto (asumiendo un nombre por línea)
            todosLosAnimales = responseText
                .split('\n')              // Dividir el texto en líneas
                .map(line => line.trim()) // Quitar espacios en blanco
                .filter(line => line.length > 0); // Eliminar líneas vacías

            datosCargados = true;
            errorAlCargarDatos = null; // Limpiar cualquier error previo
            console.log('Lista de animales cargada:', todosLosAnimales);

        } catch (error) {
            console.error('Error al cargar todos los animales:', error);
            errorAlCargarDatos = error.message;
            // Opcionalmente, mostrar un mensaje de error persistente en la interfaz si la carga falla
            if (document.getElementById('search-view').classList.contains('active')) {
                searchResultsContainer.innerHTML = `<p>Error crítico al cargar la base de datos de animales: ${errorAlCargarDatos}. Por favor, intente recargar la página.</p>`;
            }
        }
    }

    // --- Función para mostrar una vista específica ---
    function showView(viewId) {
        views.forEach(view => view.classList.remove('active'));
        navLinks.forEach(link => link.classList.remove('active'));
        const viewToShow = document.getElementById(viewId);
        if (viewToShow) viewToShow.classList.add('active');
        
        const activeLink = document.querySelector(`nav a[href="#"][id="${viewId.replace('-view', '-link')}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            const titleMap = { 'home-view': 'Hogar', 'search-view': 'Buscar Animal', 'about-view': 'Acerca De' };
            document.title = `Perros y Gatos - ${titleMap[viewId] || 'Inicio'}`;
        }

        // Si se muestra la vista de búsqueda y hay un error de carga, mostrarlo
        if (viewId === 'search-view' && errorAlCargarDatos) {
            searchResultsContainer.innerHTML = `<p>No se pudieron cargar los datos de animales: ${errorAlCargarDatos}. Intente recargar.</p>`;
        } else if (viewId === 'search-view' && !datosCargados) {
            searchResultsContainer.innerHTML = `<p>Cargando lista de animales...</p>`;
        } else if (viewId === 'search-view' && searchInput.value.trim() === '' && datosCargados){
            searchResultsContainer.innerHTML = '<p>Ingrese un término para buscar en la lista de animales cargada.</p>';
        }

    }

    // --- Event Listeners para Navegación ---
    homeLink.addEventListener('click', (event) => { event.preventDefault(); showView('home-view'); });
    searchLink.addEventListener('click', (event) => { 
        event.preventDefault(); 
        showView('search-view'); 
        // Si los datos no se han cargado y no hubo error, intentar cargar (aunque ya se intenta al inicio)
        if (!datosCargados && !errorAlCargarDatos) {
            cargarTodosLosAnimales(); // Asegurar que se intente cargar al ir a búsqueda
        }
    });
    aboutLink.addEventListener('click', (event) => { event.preventDefault(); showView('about-view'); });

    // --- Event Listener para el Botón de Búsqueda ---
    searchButton.addEventListener('click', performSearch);

    // --- Permitir buscar con Enter en el input ---
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') performSearch();
    });

    // --- Función para realizar la búsqueda (AHORA FILTRA EN JAVASCRIPT) ---
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase(); // Convertir a minúsculas para búsqueda no sensible
        searchResultsContainer.innerHTML = ''; // Limpiar resultados anteriores o mensajes

        if (!searchTerm) {
            searchResultsContainer.innerHTML = '<p>Por favor, ingresa un término de búsqueda.</p>';
            return;
        }

        if (errorAlCargarDatos) {
            searchResultsContainer.innerHTML = `<p>No se pueden realizar búsquedas. Error al cargar los datos de animales: ${errorAlCargarDatos}</p>`;
            return;
        }

        if (!datosCargados) {
            searchResultsContainer.innerHTML = '<p>Los datos de animales aún se están cargando. Por favor, espera un momento y vuelve a intentarlo.</p>';
            // Podrías intentar llamar a cargarTodosLosAnimales() aquí de nuevo si es apropiado para tu lógica.
            return;
        }
        
        searchResultsContainer.innerHTML = '<p>Buscando...</p>'; // Feedback visual inmediato

        // FILTRADO EN JAVASCRIPT:
        const resultadosFiltrados = todosLosAnimales.filter(animal => 
            animal.toLowerCase().includes(searchTerm)
        );

        displayResults(resultadosFiltrados);
    }

    // --- Función para mostrar los resultados en el DOM ---
    function displayResults(nombresAnimalesFiltrados) {
        searchResultsContainer.innerHTML = ''; // Limpiar "Buscando..." o mensajes previos

        if (!Array.isArray(nombresAnimalesFiltrados) || nombresAnimalesFiltrados.length === 0) {
            searchResultsContainer.innerHTML = '<p>No se encontraron animales que coincidan con tu búsqueda.</p>';
            return;
        }

        const resultList = document.createElement('div');
        nombresAnimalesFiltrados.forEach(nombre => {
            const item = document.createElement('div');
            item.classList.add('animal-item'); 
            item.textContent = nombre;
            resultList.appendChild(item);
        });

        searchResultsContainer.appendChild(resultList);
    }

    // --- Cargar todos los animales al iniciar la aplicación ---
    cargarTodosLosAnimales().then(() => {
        // Una vez cargados los datos (o si hubo un error),
        // actualizar la vista de búsqueda si está activa.
        if (document.getElementById('search-view').classList.contains('active')) {
            if (errorAlCargarDatos) {
                searchResultsContainer.innerHTML = `<p>Error al cargar la base de datos de animales: ${errorAlCargarDatos}. Por favor, intente recargar la página.</p>`;
            } else if (datosCargados && searchInput.value.trim() === '') {
                 searchResultsContainer.innerHTML = '<p>Ingrese un término para buscar en la lista de animales cargada.</p>';
            } else if (datosCargados) {
                // Si ya hay algo en el input de búsqueda, podríamos auto-ejecutar la búsqueda
                // performSearch();
            }
        }
    });

    // --- Mostrar la vista de inicio por defecto al cargar ---
    showView('home-view');
});
