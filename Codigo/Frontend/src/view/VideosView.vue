<template>
    <!-- Barra de navegación -->
    <Navbar />

    <!-- Sección principal: se muestra mientras se cargan los datos -->
    <main v-if="isLoading">
        <!-- Spinner de carga -->
        <div class="d-flex justify-content-center">
            <div class="spinner-grow text-primary" role="status">
                <span class="sr-only"></span>
            </div>
        </div>
    </main>

    <!-- Sección principal: se muestra cuando los datos han sido cargados -->
    <main v-show="!isLoading">
        <!-- Sección para mostrar los videos encontrados -->
        <article v-if="videos.length > 0">
            <!-- Componente de tarjeta de videos -->
            <VideosCard :videos="videos" />
        </article>

        <!-- Sección para mostrar cuando no hay videos encontrados -->
        <article v-else>
            <section class="jumbotron">
                <h1 class="display-4"><span class="material-icons icon">warning</span>Ha ocurrido un problema</h1>
                <p class="lead">Lamentablemente no hay videos para mostrar</p>
                <hr class="my-4">
                <p>Para volver a buscar un video haz click en el botón</p>
                <a href='/SearchVideo' class="btn btn-primary btn-lg">Volver</a>
            </section>
        </article>
    </main>
</template>

<script>
import { defineComponent } from 'vue';
import VideosCard from '../components/Cards/VideosCard.vue';
import Navbar from '../components/navbar.vue';
import axios from 'axios';

export default defineComponent({
    name: 'VideosView',
    components: {
        Navbar,
        VideosCard,
    },
    data() {
        return {
            videos: [], // Arreglo para almacenar los videos encontrados
            isLoading: true, // Indicador de carga inicialmente activo
        };
    },
    async mounted() {
        document.title = 'Mostrar Videos'; // Establecer el título de la página

        try {
            // Obtener el token de autenticación almacenado en localStorage
            const token = JSON.parse(localStorage.getItem('token'));
            if (!token || !token.token) {
                throw new Error('Token no encontrado');
            }

            // Obtener la URL de la API desde las variables de entorno
            const apiurl = window.env.API_URL;

            // Hacer la solicitud GET para obtener los videos que coinciden con el nombre
            const response = await axios.get(`${apiurl}/videos?=name${this.$route.params.name}`, {
                headers: {
                    authorization: `${token.token}`
                }
            });

            // Asignar los videos encontrados al arreglo de datos
            this.videos = response.data;
        } catch (error) {
            // Manejar cualquier error durante la solicitud
            console.error('No se encontraron videos', error);
        } finally {
            // Desactivar el indicador de carga
            this.isLoading = false;
        }
    }
})
</script>

<style scoped>
.btn-lg {
    border: 1px solid #ED6E00;
    background-color: #ED6E00 !important;
}

.btn-lg:active,
.btn-lg:hover {
    border: 1px solid #FD9D4A;
}

.icon {
    font-size: 4rem;
}

.jumbotron {
    margin-left: 2rem;
}
</style>
