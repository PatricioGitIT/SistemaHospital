<template>
    <Navbar /> <!-- Componente de barra de navegación -->
    <main class="cards d-flex flex-wrap gap-5 justify-content-center row-cols-5">
        <!-- Sección para subir videos, visible solo para usuarios con rol 1 -->
        <section v-if="rol === 1" class="card" style="width: 27.5rem; background-color: #005883;">
            <span class="material-icons icon">file_upload</span>
            <div class="card-body">
                <a href="/subirVideo" class="btn btn-primary">Subir Video</a>
            </div>
        </section>
        <!-- Sección para buscar videos -->
        <section class="card" style="width: 27.5rem; background-color: #005883;">
            <section class="card-body">
                <form class="formulario">
                    <div class="form-group">
                        <!-- Entrada para ingresar la palabra clave -->
                        <input class="form-control" id="PalabraClave" placeholder="Nombre" v-model="palabraClave">
                    </div>
                    <div class="text-center">
                        <!-- Botón para realizar la búsqueda -->
                        <router-link :to="{ name: 'Videos', params: { name: palabraClave } }" class="btn btn-primary">Buscar</router-link>
                    </div>
                </form>
            </section>
        </section>
    </main>
</template>

<script>
import { defineComponent } from 'vue';
import Navbar from '../components/navbar.vue'; // Componente de barra de navegación
import { VerifyToken } from '../utils/utils'; // Función para verificar el token de autenticación
import axios from 'axios'; // Librería para realizar solicitudes HTTP

export default defineComponent({
    name: 'Buscar Documentos', // Nombre del componente
    components: {
        Navbar, // Componente de barra de navegación
    },
    async mounted() {
        document.title = 'Buscar Video'; // Establece el título de la página

        const tokenData = JSON.parse(localStorage.getItem('token')); // Obtiene el token de localStorage
        if ((VerifyToken(tokenData))) { // Verifica si el token es válido
            this.$router.push('/error'); // Redirige a la página de error si el token no es válido
        }
        try {
            const apiurl = window.env.API_URL; // URL de la API
            const response = await axios.get(`${apiurl}/getRol`, { // Obtiene el rol del usuario
                headers: {
                    authorization: tokenData.token // Envía el token de autenticación en la cabecera
                }
            });
            console.log(response.data);
            this.rol = response.data; // Asigna el rol del usuario
        } catch (error) {
            this.$router.push('/error'); // Redirige a la página de error en caso de error
        }
    },
    data() {
        return {
            palabraClave: '', // Palabra clave para la búsqueda de videos
            rol: '' // Rol del usuario
        }
    }
})
</script>
<style scoped>
.icon {
    margin: auto;
    font-size: 9.375rem;
}

.formulario {
    margin-top: 25px;
}

.btn-primary:hover,
.btn-primary:active {
    border: 1px solid #FD9D4A;
}

.btn-primary {
    border: 1px solid #ED6E00;
    background-color: #ED6E00 !important;
}

.text-center {
    padding-top: 25px;
}

.card-body {
    margin: auto;
}

.white-text {
    color: white;
}
</style>