// Datos de libros por categoría (basados en las imágenes proporcionadas)
const booksData = {
    basica: [
        {
            id: 1,
            title: "Felicidad y equilibrio de vida. Una aproximación a...",
            author: "Arroyo, Ruth"
        },
        {
            id: 2,
            title: "Cómo se lo digo?",
            author: "Sacanell, Enrique"
        },
        {
            id: 3,
            title: "Aspectos ambientales. Identificación y evaluación...",
            author: "Carretero Peña, Antonio"
        },
        {
            id: 4,
            title: "Empieza a crear una guía para acercar los jóvenes...",
            author: "Martín, Danielle"
        }
    ],
    economicas: [
        {
            id: 1,
            title: "Ceremonial empresarial el ceremonial de relaciones...",
            author: "Di Génova, Antonio Ezequiel"
        },
        {
            id: 2,
            title: "Evaluacion social de proyectos",
            author: "Ernesto R. Fontainme"
        },
        {
            id: 3,
            title: "El Libro de la Negociación, 5ía. Ed.",
            author: "Puchol, Luis"
        },
        {
            id: 4,
            title: "La sociedad anestesiada el sistema economico globa...",
            author: "Kombium, Pablo"
        }
    ],
    diseno: [
        {
            id: 1,
            title: "El camino de la creatividad: Lo esencial para desa...",
            author: "Autor Desconocido"
        },
        {
            id: 2,
            title: "La comunicación del packaging: reflexiones y anal...",
            author: "Hijas, Jesus"
        },
        {
            id: 3,
            title: "Abu Rimak",
            author: "Gonzalez Trijillo, Alejandro"
        },
        {
            id: 4,
            title: "The routledge introduction to Canadian crime fiction.",
            author: "Bedore, Pamela"
        }
    ]
};

// Elementos del DOM
const booksContainer = document.getElementById('books-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const categoryTitle = document.querySelector('h1.display-5');

// Obtener parámetro de categoría de la URL
const urlParams = new URLSearchParams(window.location.search);
const categoria = urlParams.get('categoria') || 'basica';

// Configurar título según categoría
function setCategoryTitle() {
    const titles = {
        basica: "Básica y Transversales",
        economicas: "Ciencias Económicas y Administrativas",
        diseno: "Diseño Gráfico"
    };
    categoryTitle.textContent = `"${titles[categoria]}"`;
}

// Renderizar libros en el contenedor
function renderBooks(books) {
    booksContainer.innerHTML = '';
    
    if (books.length === 0) {
        booksContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3 class="text-muted">No se encontraron libros</h3>
                <p>Intenta con otros términos de búsqueda</p>
            </div>
        `;
        return;
    }
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'col-md-6 col-lg-4';
        bookCard.innerHTML = `
            <div class="book-card card h-100 shadow">
                <div class="card-body d-flex">
                    <div class="me-3">
                        <i class="bi bi-journal-bookmark fs-2"></i>
                    </div>
                    <div>
                        <h3 class="card-title h5">${book.title}</h3>
                        <p class="card-subtitle mb-2 text-muted">${book.author}</p>
                    </div>
                </div>
            </div>
        `;
        booksContainer.appendChild(bookCard);
    });
}

// Filtrar libros según término de búsqueda
function filterBooks() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredBooks = booksData[categoria].filter(book => 
        book.title.toLowerCase().includes(searchTerm) || 
        book.author.toLowerCase().includes(searchTerm)
    );
    renderBooks(filteredBooks);
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    setCategoryTitle();
    renderBooks(booksData[categoria]);
});

// Event listeners
searchInput.addEventListener('input', filterBooks);
searchButton.addEventListener('click', filterBooks);