document.addEventListener('DOMContentLoaded', function () {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const cancelBtn = document.querySelector('.c');
    const acceptBtn = document.querySelector('.acp');
    const loginForm = document.querySelector('form');

    const API_BASE_URL = 'http://127.0.0.1:8000';

    cancelBtn.addEventListener('click', function () {
        loginForm.reset();
    });

    acceptBtn.addEventListener('click', async function () {
        if (!validateForm()) {
            return;
        }

        acceptBtn.disabled = true;
        acceptBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cargando...';

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    identificacion: emailInput.value.trim(),
                    password: passwordInput.value
                })
            });

            const data = await response.json();
            data.user.password = null

            if (!response.ok) {
                showAlert('error', data.detail);
            }
            
            handleSuccessfulLogin(data);
        } catch (error) {
            showAlert('error', "credenciales incorrectas!");
        } finally {
            acceptBtn.disabled = false;
            acceptBtn.textContent = 'ACEPTAR';
        }
    });

    function validateForm() {
        if (!emailInput.value.trim()) {
            showAlert('error', 'Por favor ingrese su correo electrónico');
            emailInput.focus();
            return false;
        }

        if (!passwordInput.value) {
            showAlert('error', 'Por favor ingrese su contraseña');
            passwordInput.focus();
            return false;
        }

        return true;
    }

    function handleSuccessfulLogin(data) {
        localStorage.setItem('userData', JSON.stringify(data.user));
        showAlert('success', 'Inicio de sesión exitoso. Redirigiendo...');

        setTimeout(() => {
            if (data.user.rol === "Administrador") {
                window.location.href = './Interfaces del admin/Inicio.html';
            } else {
                window.location.href = './Interfaces de usuario/Inicio.html';
            }
        }, 1000);
    }

    function showAlert(type, message) {
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        loginForm.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 5000);
    }

    loginForm.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            acceptBtn.click();
        }
    });
});