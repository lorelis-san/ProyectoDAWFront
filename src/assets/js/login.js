 document.getElementById('loginForm').addEventListener('submit', async e => {
        e.preventDefault();

        const submitBtn = document.getElementById('loginBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;

        // Add loading state
        submitBtn.disabled = true;
        btnText.innerHTML = '<span class="loading-spinner"></span>Validando...';

        const formData = new FormData(e.target);
        const user = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            if (!res.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data = await res.json();
            const role = data.message;

            btnText.innerHTML = '<span class="loading-spinner"></span>Accediendo...';

            // Simulate a brief delay for better UX
            setTimeout(() => {
                if (role === 'ROLE_ADMIN') {
                    window.location.href = '/';
                } else if (role === 'ROLE_USER') {
                    window.location.href = '/';
                } else {
                    alert('Rol no reconocido');
                    resetButton();
                }
            }, 800);

        } catch (error) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
            resetButton();

            // Hide error after 5 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }

        function resetButton() {
            submitBtn.disabled = false;
            btnText.textContent = originalText;
        }
    });

    console.log("voy a ingresar a lo de cookies");

    window.onload = function() {
        fetch('/auth/check-auth')
            .then(response => {
                console.log("validando");
                if (response.ok) {
                    console.log("Sesión activa");
                    // Si quieres, puedes redirigir manualmente
                    // window.location.href = '/';
                } else {
                    console.log("Sesión no activa, quedarse en login");
                }
            })
            .catch(error => {
                console.log("Error de autenticación:", error);
            });
    };

    // Input focus effects
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-1px)';
        });

        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });