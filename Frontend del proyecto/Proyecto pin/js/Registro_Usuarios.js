document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM cargado, iniciando script...");
    
const initialUserData = [
    {
        id: 1,
        fecha: "2023-10-15",
        identificacion: "ID-1001",
        nombre: "Juan Pérez",
        sede: "Soledad",
        tipo_usuario: "Estudiante",
        datos_usuario: "Ingeniería - Semestre 5"
    },
    {
        id: 2,
        fecha: "2023-11-01",
        identificacion: "ID-1002",
        nombre: "María García",
        sede: "Plaza de la paz",
        tipo_usuario: "Administrador",
        datos_usuario: "Biblioteca Central"
    },
    {
        id: 3,
        fecha: "2023-11-20",
        identificacion: "ID-1003",
        nombre: "Carlos López",
        sede: "Colsamiro",
        tipo_usuario: "Funcionario",
        datos_usuario: "Departamento de Matemáticas"
    },
    {
        id: 4,
        fecha: "2023-12-05",
        identificacion: "ID-1004",
        nombre: "Ana Martínez",
        sede: "Soledad",
        tipo_usuario: "Estudiante",
        datos_usuario: "Diseño - Semestre 3"
    },
    {
        id: 5,
        fecha: "2023-12-10",
        identificacion: "ID-1005",
        nombre: "Luis Rodríguez",
        sede: "Plaza de la paz",
        tipo_usuario: "Estudiante",
        datos_usuario: "Medicina - Semestre 7"
    },
    {
        id: 6,
        fecha: "2023-12-15",
        identificacion: "ID-1006",
        nombre: "Sofía Hernández",
        sede: "Colsamiro",
        tipo_usuario: "Funcionario",
        datos_usuario: "Departamento de Ciencias"
    },
    {
        id: 7,
        fecha: "2024-01-10",
        identificacion: "ID-1007",
        nombre: "Pedro Vargas",
        sede: "Soledad",
        tipo_usuario: "Estudiante",
        datos_usuario: "Derecho - Semestre 9"
    },
    {
        id: 8,
        fecha: "2024-01-15",
        identificacion: "ID-1008",
        nombre: "Laura Jiménez",
        sede: "Plaza de la paz",
        tipo_usuario: "Administrador",
        datos_usuario: "Decanatura"
    }
    ];

    let usuariosData = JSON.parse(localStorage.getItem('usuarios')) || initialUserData;
    console.log("Datos a renderizar:", usuariosData);

    function renderUserTable(data) {
        const tbody = document.querySelector('tbody');
        if (!tbody) {
            console.error("No se encontró el elemento tbody");
            return;
        }
        tbody.innerHTML = '';
        data.forEach(usuario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${usuario.id}</th>
                <td>${usuario.fecha}</td>
                <td>${usuario.identificacion}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.sede}</td>
                <td><span class="badge ${getTipoUsuarioClass(usuario.tipo_usuario)}">${usuario.tipo_usuario}</span></td>
                <td>${usuario.datos_usuario}</td>
            `;
            tbody.appendChild(row);
        });
    }

    function getTipoUsuarioClass(tipo) {
        const tipos = {
            'Administrador': 'bg-danger',
            'Estudiante': 'bg-success',
            'Funcionario': 'bg-primary'
        };
        return tipos[tipo] || 'bg-secondary';
    }

    renderUserTable(usuariosData);
    localStorage.setItem('usuarios', JSON.stringify(usuariosData));
    
    console.log("Tabla renderizada correctamente");
});