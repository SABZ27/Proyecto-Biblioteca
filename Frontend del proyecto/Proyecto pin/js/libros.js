const URL = "http://127.0.0.1:8000/";

document.addEventListener('DOMContentLoaded', async function () {
    setupSearch();
    setupFilters();
    setupFormValidation();
    setupCRUD();
    setupPagination();
    setupColumnSorting();
    await loadBooks();
    setupExport();
});

// BÚSQUEDA ACTUALIZADA (solo al presionar enter o el botón)
function setupSearch() {
    const searchForm = document.querySelector('form.d-flex');
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const searchInput = document.querySelector('input[placeholder="Buscar registro"]');
            const searchTerm = searchInput.value.trim().toLowerCase();
            const rows = document.querySelectorAll('tbody tr');

            rows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(searchTerm) ? '' : 'none';
            });

            if (document.querySelector('.pagination')) {
                setupPagination();
            }
        });
    }
}

// FILTROS (autores, año y virtual)
function setupFilters() {
    const filterButton = document.getElementById('filterBtn');
    if (filterButton) {
        filterButton.addEventListener('click', applyFilters);
    }
}

function applyFilters() {
    const autor = document.getElementById('autores')?.value || '';
    const anio = document.getElementById('anio')?.value || '';
    const virtual = document.getElementById('virtual')?.value || '';

    // Si todos los filtros están vacíos, mostrar todas las filas
    if (!autor && !anio && !virtual) {
        document.querySelectorAll('tbody tr').forEach(row => {
            row.style.display = '';
        });
        if (document.querySelector('.pagination')) {
            setupPagination();
        }
        return;
    }

    document.querySelectorAll('tbody tr').forEach(row => {
        const rowData = {
            autor: row.cells[2].textContent.trim().toLowerCase(),
            anio: row.cells[4].textContent.trim(),
            virtual: row.cells[6].textContent.trim().toLowerCase()
        };

        const matchesAutor = !autor || rowData.autor.includes(autor.toLowerCase());
        const matchesAnio = !anio || rowData.anio === anio;
        const matchesVirtual = !virtual || 
            (virtual === 'si' && rowData.virtual === 'sí') || 
            (virtual === 'no' && rowData.virtual === 'no');

        row.style.display = (matchesAutor && matchesAnio && matchesVirtual) ? '' : 'none';
    });

    if (document.querySelector('.pagination')) {
        setupPagination();
    }
}

function setupFormValidation() {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function (e) {
            const searchInput = document.querySelector('input[placeholder="Buscar registro"]');
            if (searchInput && searchInput.value.trim() === '') {
                e.preventDefault();
                showAlert('Por favor ingrese un término de búsqueda', 'warning');
                searchInput.focus();
            }
        });
    }
}

// CRUD (Crear, Leer, Actualizar, Eliminar)
function setupCRUD() {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('bi-trash3')) {
            deleteRow(e.target);
        }
        if (e.target.classList.contains('bi-pencil-square')) {
            // Botón deshabilitado según solicitud
            e.preventDefault();
            showAlert('La edición está deshabilitada', 'info');
        } else if (e.target.classList.contains('bi-eye')) {
            const bookId = e.target.closest('.view-btn').getAttribute('data-id');
            viewBookDetails(bookId);
        }
    });
}

function deleteRow(deleteButton) {
    if (confirm('¿Está seguro de eliminar este registro?')) {
        const row = deleteButton.closest('tr');
        row.remove();
        showAlert('Registro eliminado correctamente', 'success');
        if (document.querySelector('.pagination')) {
            setupPagination();
        }
    }
}

// PAGINACIÓN
function setupPagination() {
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) existingPagination.remove();

    const rows = Array.from(document.querySelectorAll('tbody tr')).filter(row =>
        row.style.display !== 'none'
    );

    if (rows.length <= 5) {
        rows.forEach(row => row.style.display = '');
        return;
    }

    const pageCount = Math.ceil(rows.length / 5);
    const paginationContainer = document.querySelector('.pagination-container');
    const paginationList = document.createElement('ul');
    paginationList.className = 'pagination';

    // Botón "Anterior"
    const prevItem = document.createElement('li');
    prevItem.className = 'page-item';
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.innerHTML = '&laquo;';
    prevLink.addEventListener('click', (e) => {
        e.preventDefault();
        const activePage = document.querySelector('.pagination .active');
        if (activePage && activePage.previousElementSibling && activePage.previousElementSibling.classList.contains('page-item')) {
            const pageNum = parseInt(activePage.previousElementSibling.textContent);
            if (pageNum) showPage(pageNum, rows);
        }
    });
    prevItem.appendChild(prevLink);
    paginationList.appendChild(prevItem);

    // Números de página
    for (let i = 1; i <= pageCount; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === 1 ? 'active' : ''}`;
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(i, rows);
        });
        pageItem.appendChild(pageLink);
        paginationList.appendChild(pageItem);
    }

    // Botón "Siguiente"
    const nextItem = document.createElement('li');
    nextItem.className = 'page-item';
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.innerHTML = '&raquo;';
    nextLink.addEventListener('click', (e) => {
        e.preventDefault();
        const activePage = document.querySelector('.pagination .active');
        if (activePage && activePage.nextElementSibling && activePage.nextElementSibling.classList.contains('page-item')) {
            const pageNum = parseInt(activePage.nextElementSibling.textContent);
            if (pageNum) showPage(pageNum, rows);
        }
    });
    nextItem.appendChild(nextLink);
    paginationList.appendChild(nextItem);

    // Limpiar y agregar nueva paginación
    paginationContainer.innerHTML = '';
    paginationContainer.appendChild(paginationList);
    showPage(1, rows);
}

function showPage(page, rows) {
    const start = (page - 1) * 5;
    const end = start + 5;

    rows.forEach((row, index) => {
        row.style.display = (index >= start && index < end) ? '' : 'none';
    });

    // Actualizar clase active
    document.querySelectorAll('.pagination .page-item').forEach((item, idx) => {
        // Saltar los botones de navegación (primer y último elemento)
        if (idx > 0 && idx < document.querySelectorAll('.pagination .page-item').length - 1) {
            const pageNum = parseInt(item.textContent);
            item.classList.toggle('active', pageNum === page);
        }
    });
}

// ORDENACIÓN POR COLUMNAS
function setupColumnSorting() {
    document.querySelectorAll('th[scope="col"]').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function () {
            const columnIndex = this.cellIndex;
            const isNumericColumn = ['id', 'año'].includes(this.textContent.toLowerCase());
            const table = this.closest('table');
            const rows = Array.from(table.querySelectorAll('tbody tr')).filter(row =>
                row.style.display !== 'none'
            );

            document.querySelectorAll('th[scope="col"]').forEach(h => {
                h.classList.remove('asc', 'desc');
            });

            let isAscending;
            if (this.classList.contains('asc')) {
                this.classList.remove('asc');
                this.classList.add('desc');
                isAscending = false;
            } else if (this.classList.contains('desc')) {
                this.classList.remove('desc');
                isAscending = null;
            } else {
                this.classList.add('asc');
                isAscending = true;
            }

            if (isAscending !== null) {
                rows.sort((a, b) => {
                    const aText = a.cells[columnIndex].textContent.trim();
                    const bText = b.cells[columnIndex].textContent.trim();

                    if (isNumericColumn) {
                        return isAscending
                            ? (parseInt(aText) || 0) - (parseInt(bText) || 0)
                            : (parseInt(bText) || 0) - (parseInt(aText) || 0);
                    } else {
                        return isAscending
                            ? aText.localeCompare(bText)
                            : bText.localeCompare(aText);
                    }
                });
            } else {
                // Orden por defecto (ID ascendente)
                rows.sort((a, b) => parseInt(a.cells[0].textContent) - parseInt(b.cells[0].textContent));
            }

            const tbody = table.querySelector('tbody');
            rows.forEach(row => tbody.appendChild(row));

            if (document.querySelector('.pagination')) {
                const activePage = document.querySelector('.pagination .active');
                if (activePage) showPage(parseInt(activePage.textContent), rows);
            }
        });
    });
}

// CARGA DE DATOS INICIAL
async function loadBooks() {
    const requestOptions = {method: "GET"};

    try {
        const response = await fetch(`${URL}libros`, requestOptions);
        const data = await response.json();
        // Ordenar por ID ascendente
        data.sort((a, b) => a.ID - b.ID);
        populateTable(data);
    } catch (error) {
        console.error('Error al obtener libros:', error);
        showAlert('Error al cargar los libros', 'danger');
        return [];
    }
}

// Función nueva para manejar saltos de línea
function formatTextWithLineBreaks(text, maxLength = 20) {
    if (!text) return '';
    
    let result = '';
    let currentLine = '';
    
    const words = text.split(' ');
    for (const word of words) {
        if (currentLine.length + word.length + 1 <= maxLength) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            result += (result ? '<br>' : '') + currentLine;
            currentLine = word;
        }
    }
    
    if (currentLine) {
        result += (result ? '<br>' : '') + currentLine;
    }
    
    return result;
}

// Modificación solo en la función populateTable
function populateTable(books) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        const formattedTitle = formatTextWithLineBreaks(book.Titulo);
        const virtualStatus = book.Registro_en_linea ? 'Sí' : 'No';

        row.innerHTML = `
            <th scope="row" class="text-start">${book.ID}</th>
            <td class="text-start title-cell">${formattedTitle}</td>
            <td class="text-start">${book.Autor}</td>
            <td class="text-start">${book.Ejemplar}</td>
            <td class="text-start">${book.Año}</td>
            <td class="text-start">${book.Idioma}</td>
            <td class="text-start">${virtualStatus}</td>
            <td class="text-start">
                <button class="btn acp text-white ms-2" style="height: 38px;"><i class="bi bi-pencil-square"></i></button>
                <button class="btn acp text-white ms-2" style="height: 38px;"><i class="bi bi-trash3"></i></button>
                <button class="btn acp text-white ms-2 view-btn" style="height: 38px;" data-id="${book.ID}"><i class="bi bi-eye"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Agregar event listeners para los botones de visualización
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const bookId = btn.getAttribute('data-id');
            viewBookDetails(bookId);
        });
    });

    loadFilterOptions(books);
    setupPagination();
}
async function viewBookDetails(bookId) {
    try {
        const response = await fetch(`${URL}libros/${bookId}`);
        if (!response.ok) {
            throw new Error('Libro no encontrado');
        }
        const book = await response.json();
        
        // Crear y mostrar el modal
        showBookModal(book);
    } catch (error) {
        console.error('Error al obtener detalles del libro:', error);
        showAlert('Error al cargar los detalles del libro', 'danger');
    }
}

function showBookModal(book) {
    // Crear el modal si no existe
    if (!document.getElementById('bookModal')) {
        const modalHTML = `
        <div class="modal fade" id="bookModal" tabindex="-1" aria-labelledby="bookModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="bookModalLabel">Detalles del Libro</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>ID:</strong> <span id="modalBookId">${book.ID}</span></p>
                                    <p><strong>Título:</strong> <span id="modalBookTitle">${book.Titulo}</span></p>
                                    <p><strong>Autor:</strong> <span id="modalBookAuthor">${book.Autor}</span></p>
                                    <p><strong>Programa:</strong> <span id="modalBookProgram">${book.Programa}</span></p>
                                    <p><strong>Item:</strong> <span id="modalBookItem">${book.Item}</span></p>
                                    <p><strong>Signatura:</strong> <span id="modalBookSign">${book.Signatura}</span></p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Áreas:</strong> <span id="modalBookAreas">${book.Areas}</span></p>
                                    <p><strong>Ejemplares:</strong> <span id="modalBookCopies">${book.Ejemplar}</span></p>
                                    <p><strong>Editorial:</strong> <span id="modalBookEditorial">${book.Editorial}</span></p>
                                    <p><strong>Año:</strong> <span id="modalBookYear">${book.Año}</span></p>
                                    <p><strong>Idioma:</strong> <span id="modalBookLanguage">${book.Idioma}</span></p>
                                    <p><strong>Virtual:</strong> <span id="modalBookVirtual">${book.Registro_en_linea ? 'Sí' : 'No'}</span></p>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-12">
                                    <p><strong>Observaciones:</strong> <span id="modalBookObservations">${book.Observaciones || 'N/A'}</span></p>
                                    <p><strong>Precio:</strong> <span id="modalBookPrice">${book.Precio || 'N/A'}</span></p>
                                    <p><strong>Proveedor:</strong> <span id="modalBookProvider">${book.Proveedor || 'N/A'}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Se ha eliminado el modal-footer con el botón Cerrar -->
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Resto del código para actualizar los datos del modal...
    document.getElementById('modalBookId').textContent = book.ID;
    document.getElementById('modalBookTitle').textContent = book.Titulo;
    document.getElementById('modalBookAuthor').textContent = book.Autor;
    document.getElementById('modalBookProgram').textContent = book.Programa;
    document.getElementById('modalBookItem').textContent = book.Item;
    document.getElementById('modalBookSign').textContent = book.Signatura;
    document.getElementById('modalBookAreas').textContent = book.Areas;
    document.getElementById('modalBookCopies').textContent = book.Ejemplar;
    document.getElementById('modalBookEditorial').textContent = book.Editorial;
    document.getElementById('modalBookYear').textContent = book.Año;
    document.getElementById('modalBookLanguage').textContent = book.Idioma;
    document.getElementById('modalBookVirtual').textContent = book.Registro_en_linea ? 'Sí' : 'No';
    document.getElementById('modalBookObservations').textContent = book.Observaciones || 'N/A';
    document.getElementById('modalBookPrice').textContent = book.Precio || 'N/A';
    document.getElementById('modalBookProvider').textContent = book.Proveedor || 'N/A';

    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('bookModal'));
    modal.show();
}

// Cargar opciones de filtro dinámicas
function loadFilterOptions(books) {
    // Autores
    const autoresSelect = document.getElementById('autores');
    if (autoresSelect) {
        autoresSelect.innerHTML = '<option value="">Autores</option>';
        const autores = [...new Set(books.map(book => book.Autor))];
        autores.forEach(autor => {
            const option = document.createElement('option');
            option.value = autor;
            option.textContent = autor;
            autoresSelect.appendChild(option);
        });
    }

    // Años
    const anioSelect = document.getElementById('anio');
    if (anioSelect) {
        anioSelect.innerHTML = '<option value="">Año</option>';
        const years = [...new Set(books.map(book => book.Año))].sort((a, b) => b - a);
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            anioSelect.appendChild(option);
        });
    }
}

// EXPORTACIÓN A CSV
function setupExport() {
    if (!document.getElementById('exportBtn')) {
        const exportBtn = document.createElement('button');
        exportBtn.id = 'exportBtn';
        exportBtn.className = 'btn acp text-white ms-2';
        exportBtn.style.height = '38px';
        exportBtn.innerHTML = '<i class="bi bi-download"></i> Exportar';
        exportBtn.addEventListener('click', exportToCSV);

        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.appendChild(exportBtn);
        }
    }
}

function exportToCSV() {
    // Mostrar mensaje de que se está generando el archivo
    showAlert('Generando archivo CSV...', 'info');
    
    // Obtener todos los libros desde la API
    fetch(`${URL}libros`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            }
            return response.json();
        })
        .then(books => {
            // Ordenar por ID ascendente como en la tabla
            books.sort((a, b) => a.ID - b.ID);
            
            let csvContent = "data:text/csv;charset=utf-8,";
            
            // Encabezados completos según database.py
            const headers = [
                "ID", "Autor", "Título", "Programa", "Item", 
                "Signatura", "Areas", "Ejemplar", "Editorial", 
                "Año", "Idioma", "Observaciones", "Precio", 
                "Proveedor", "Registro_en_linea"
            ];
            csvContent += headers.join(",") + "\r\n";

            // Filas de datos completas
            books.forEach(book => {
                const virtualStatus = book.Registro_en_linea ? 'Sí' : 'No';
                const rowData = [
                    book.ID,
                    `"${book.Autor.replace(/"/g, '""')}"`,
                    `"${book.Titulo.replace(/"/g, '""')}"`,
                    `"${book.Programa.replace(/"/g, '""')}"`,
                    book.Item,
                    `"${book.Signatura.replace(/"/g, '""')}"`,
                    book.Areas,
                    book.Ejemplar,
                    `"${book.Editorial.replace(/"/g, '""')}"`,
                    book.Año,
                    `"${book.Idioma.replace(/"/g, '""')}"`,
                    book.Observaciones ? `"${book.Observaciones.replace(/"/g, '""')}"` : 'N/A',
                    book.Precio ? `"${book.Precio.replace(/"/g, '""')}"` : 'N/A',
                    book.Proveedor ? `"${book.Proveedor.replace(/"/g, '""')}"` : 'N/A',
                    virtualStatus
                ];
                csvContent += rowData.join(",") + "\r\n";
            });

            // Crear y descargar el archivo
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "libros_completos.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showAlert('Exportación completada', 'success');
        })
        .catch(error => {
            console.error('Error al exportar libros:', error);
            showAlert('Error al exportar los libros: ' + error.message, 'danger');
        });
}

// MOSTRAR ALERTAS
function showAlert(message, type) {
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) existingAlert.remove();

    const alert = document.createElement('div');
    alert.className = `custom-alert alert alert-${type} fixed-top w-50 mx-auto mt-5 text-center`;
    alert.style.zIndex = '2000';
    alert.textContent = message;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 3000);
}

function updateBooks(idBook) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "Autor": "Magnus Carlsen 2",
        "Titulo": "Estrategias Avanzadas de Ajedrez",
        "Programa": "Especialización en juegos de estrategia",
        "Item": 2,
        "Signatura": "794.1/M38",
        "Areas": 700,
        "Ejemplar": 3,
        "Editorial": "Editorial Planeta",
        "Año": 2022,
        "Idioma": "Español",
        "Observaciones": "Adquisición 2024-1",
        "Precio": "$45.000",
        "Proveedor": "Librería Internacional",
        "Registro_en_linea": "si"
    });

    const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: raw
    };

    fetch(`${URL}libros/${idBook}`, requestOptions)
        .then((response) => response.json())
        .then((result) =>{
            alert("Actualización completada")
            location.reload()
        })
        .catch((error) => console.error(error));
}