<template>
    <!-- Barra de navegación -->
    <nav class="navbar navbar-expand-lg bg-body-tertiary ">
        <div class="container-fluid">
            <!-- Logo del hospital -->
            <span><img src="../assets/logo_top.png" alt="Logo del hospital" class="imagen"></span>
            <!-- Botón para mostrar/ocultar el menú en dispositivos móviles -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo02"
                aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <!-- Contenido del menú -->
            <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
                <!-- Lista de enlaces de navegación -->
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <!-- Itera sobre los enlaces y muestra cada uno -->
                    <li class="nav-item" v-for="link in links">
                        <router-link class="nav-link" :to="link.url">{{ link.name }}</router-link>
                    </li>
                </ul>
                <!-- Botón de cierre de sesión -->
                <ul class="d-flex list-unstyled">
                    <li class="nav-btn">
                        <router-link class="nav-link" to="/"><span class="material-icons">
                                exit_to_app
                            </span>Cerrar sesión</router-link>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import { defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
    data() {
        return {
            // Array de enlaces de navegación
            links: [
                { name: 'Menú', url: '/menu' },
                { name: 'Buscar Documentos', url: '/SearchDocuments' },
                { name: 'Buscar Videos', url: '/SearchVideo' },
            ]
        };
    },
    name: 'Navbar', // Nombre del componente
    async mounted() {
        // Obtener el token del almacenamiento local
        const token = JSON.parse(localStorage.getItem('token'))
        const tokenData = token.token
        if (tokenData) {
            try {
                // Obtener el rol del usuario desde la API
                const apiurl = window.env.API_URL
                const response = await axios.get(`${apiurl}/getRol`, {
                    headers: {
                        authorization: tokenData
                    }
                })
                const rol = response.data
                // Si el rol es 1 (administrador), agregar el enlace de Gestión de Usuarios
                if (rol === 1) {
                    this.links.push({ name: 'Gestión Usuarios', url: '/Users' })
                }
            } catch (error) {
                // Manejo de errores al obtener el rol
                console.log('Error en obtener rol')
                this.$router.push('/error')
            }
        }
    }
});
</script>

<style>
/* Estilos personalizados */
.container-fluid {
    background-color: #D9D9D9; /* Fondo del contenedor */
}

.nav-item {
    margin: 20px; /* Espaciado entre los elementos del menú */
}

.imagen {
    width: 195px; /* Ancho de la imagen del logo */
    height: 126px; /* Alto de la imagen del logo */
}
</style>
