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

// FILTROS (categorías, autores, año y registro en línea)
function setupFilters() {
    const filterButton = document.getElementById('filterBtn');
    if (filterButton) {
        filterButton.addEventListener('click', applyFilters);
    }
}

function applyFilters() {
    const categoria = document.getElementById('categorias')?.value || '';
    const autor = document.getElementById('autores')?.value || '';
    const anio = document.getElementById('anio')?.value || '';
    const registroEnLinea = document.getElementById('tipo')?.value || '';

    document.querySelectorAll('tbody tr').forEach(row => {
        const rowData = {
            autor: row.cells[1].textContent.trim().toLowerCase(),
            categoria: row.cells[10].textContent.trim().toLowerCase(),
            anio: row.cells[7].textContent.trim(),
            registroEnLinea: row.cells[9].textContent.trim().toLowerCase()
        };

        // Mapeo de valores
        const categoriaMap = {
            'ingenieria_telematica': 'ingenieria telematica',
            'ingenieria_industrial': 'ingenieria industrial',
            'ingenieria_mecatronica': 'ingenieria mecatronica',
            'diseno_grafico': 'diseño grafico',
            'transversales': 'transversales',
            'negocios_internacionales': 'negocios internacionales'
        };

        const autorMap = {
            'miguel_pombo': 'miguel pombo',
            'mario_benedetti': 'mario benedetti',
            'isaacs_newton': 'isaac newton'
        };

        const registroValue = registroEnLinea === 'si' ? 'sí' :
            registroEnLinea === 'no' ? 'no' : '';

        const matchesCategoria = !categoria ||
            (rowData.categoria && rowData.categoria.includes(categoriaMap[categoria]?.toLowerCase() || ''));
        const matchesAutor = !autor ||
            (rowData.autor && rowData.autor.includes(autorMap[autor]?.toLowerCase() || ''));
        const matchesAnio = !anio || rowData.anio === anio;
        const matchesRegistro = !registroEnLinea ||
            (rowData.registroEnLinea === registroValue);

        row.style.display = (matchesCategoria && matchesAutor && matchesAnio && matchesRegistro) ? '' : 'none';
    });

    if (document.querySelector('.pagination')) {
        setupPagination();
    }
}

function setupFormValidation() {
    // Validación básica (puedes expandir según necesidades)
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
            enableEditMode(e.target);
        } else if (e.target.classList.contains('bi-check')) {
            saveChanges(e.target);
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

function enableEditMode(editButton) {
    const row = editButton.closest('tr');
    const cells = row.querySelectorAll('td:not(:last-child)');

    cells.forEach(cell => {
        if (!cell.querySelector('input')) {
            const currentText = cell.textContent;
            cell.innerHTML = `<input type="text" value="${currentText}" class="form-control form-control-sm">`;
        }
    });

    editButton.classList.remove('bi-pencil-square');
    editButton.classList.add('bi-check');
}

function saveChanges(saveButton) {
    const row = saveButton.closest('tr');
    const cells = row.querySelectorAll('td:not(:last-child)');
    const rowId = row.cells[0].textContent;
    const updatedData = {};

    cells.forEach((cell, index) => {
        if (cell.querySelector('input')) {
            const newValue = cell.querySelector('input').value;
            cell.textContent = newValue;

            const columnName = document.querySelector(`th:nth-child(${index + 2})`).textContent.toLowerCase();
            updatedData[columnName] = newValue;
        }
    });

    saveButton.classList.remove('bi-check');
    saveButton.classList.add('bi-pencil-square');

    showAlert('Cambios guardados correctamente', 'success');
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
    const pagination = document.createElement('div');
    pagination.className = 'pagination justify-content-center mt-3';

    for (let i = 1; i <= pageCount; i++) {
        const pageLink = document.createElement('button');
        pageLink.className = 'btn btn-sm mx-1';
        if (i === 1) pageLink.classList.add('btn-primary');
        pageLink.textContent = i;
        pageLink.addEventListener('click', () => showPage(i, rows));
        pagination.appendChild(pageLink);
    }

    document.querySelector('.table-responsive').appendChild(pagination);
    showPage(1, rows);
}

function showPage(page, rows) {
    const start = (page - 1) * 5;
    const end = start + 5;

    rows.forEach((row, index) => {
        row.style.display = (index >= start && index < end) ? '' : 'none';
    });

    document.querySelectorAll('.pagination button').forEach(btn => {
        btn.classList.toggle('btn-primary', parseInt(btn.textContent) === page);
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
                rows.sort((a, b) => parseInt(a.cells[0].textContent) - parseInt(b.cells[0].textContent));
            }

            const tbody = table.querySelector('tbody');
            rows.forEach(row => tbody.appendChild(row));

            if (document.querySelector('.pagination')) {
                const activePage = document.querySelector('.pagination button.btn-primary');
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
        populateTable(data);
    } catch (error) {
        console.error('Error al obtener libros:', error);
        return [];
    }
}

function populateTable(books) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row">${book.ID}</th>
            <td>${book.Titulo}</td>
            <td>${book.Autor}</td>
            <td>${book.Signatura}</td>
            <td>${book.Ejemplar}</td>
            <td>${book.Editorial}</td>
            <td>${book.Año}</td>
            <td>${book.Idioma}</td>
            <td>${book.Registro_en_linea}</td>
            <td>
                <button class="btn acp text-white ms-2" style="height: 38px;"><i class="bi bi-pencil-square"></i></button>
                <button class="btn acp text-white ms-2" style="height: 38px;"><i class="bi bi-trash3"></i></button>
                <button class="btn acp text-white ms-2 d-none" style="height: 38px;"><i class="bi bi-eye"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });

    setupPagination();
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
    const rows = document.querySelectorAll('tbody tr');
    let csvContent = "data:text/csv;charset=utf-8,";

    const headers = Array.from(document.querySelectorAll('thead th')).map(th => th.textContent);
    csvContent += headers.join(",") + "\n";

    rows.forEach(row => {
        if (row.style.display !== 'none') {
            const rowData = Array.from(row.cells).map(cell => `"${cell.textContent.replace(/"/g, '""')}"`);
            csvContent += rowData.join(",") + "\n";
        }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "libros.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAlert('Exportación completada', 'success');
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
    // los input y los validas

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