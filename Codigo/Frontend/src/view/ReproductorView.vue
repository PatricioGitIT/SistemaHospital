<template>
    <Navbar /> <!-- Componente de barra de navegación -->
    <main v-if="isLoading"> <!-- Muestra un spinner de carga mientras se está cargando el video -->
        <div class="d-flex justify-content-center">
            <div class="spinner-grow text-primary" role="status">
                <span class="sr-only"></span>
            </div>
        </div>
    </main>
    <main v-show="!isLoading"> <!-- Muestra el contenido del video una vez que se ha cargado -->
        <article v-if="video"> <!-- Si hay un video disponible -->
            <section>
                <div style="text-align: right;">
                    <span>en caso de no cargar</span>
                    <a :href="this.$route.params.url" target="_blank"> haz click aquí</a> <!-- Enlace alternativo para abrir el video en una nueva pestaña -->
                </div>
                <!-- Componente ReproductorVideo para reproducir el video -->
                <ReproductorVideo :videoURL="videoURL" />
            </section>
            <section class="jumbotron jumbotron-fluid">
                <!-- Descripción del video -->
                <div class="container">
                    <h4 class="display-4">Descripción</h4>
                    <p class="lead">{{ this.$route.params.descripcion }}</p>
                </div>
            </section>
        </article>
        <article v-else> <!-- Si no hay un video disponible -->
            <section class="jumbotron">
                <h1 class="display-4"><span class="material-icons icon">warning</span>Ha ocurrido un problema</h1>
                <p class="lead">Lamentablemente no hay video para mostrar</p>
                <hr class="my-4">
                <p>Para volver buscar otros videos haz click en el botón</p>
                <a href='/SearchVideo' class="btn btn-primary btn-lg">Volver</a> <!-- Enlace para volver a la página de búsqueda de videos -->
            </section>
        </article>
    </main>
</template>

<script>
import { defineComponent } from 'vue';
import Navbar from '../components/navbar.vue'; // Componente de barra de navegación
import ReproductorVideo from '../components/ReproductorVideo.vue'; // Componente de reproductor de video
import { VerifyToken } from '../utils/utils'; // Función para verificar el token de autenticación
import axios from 'axios'; // Librería para realizar solicitudes HTTP

export default defineComponent({
    name: 'ReproductorView', // Nombre del componente
    components: {
        Navbar, // Componente de barra de navegación
        ReproductorVideo, // Componente de reproductor de video
    },
    data() {
        return {
            videoURL: '', // URL del video
            video: false, // Indica si hay un video disponible o no
            isLoading: true, // Indica si se está cargando el video
        };
    },
    methods: {
        async obtenerVideo(id) { // Método para obtener el video por su ID
            const token = JSON.parse(localStorage.getItem('token')); // Obtiene el token de localStorage
            try {
                const apiurl = window.env.API_URL; // URL de la API
                const response = await axios.get(`${apiurl}/videos/${id}`, { // Realiza una solicitud GET para obtener el video
                    headers: {
                        authorization: token.token // Envía el token de autenticación en la cabecera
                    },
                    responseType: 'blob', // Se espera una respuesta de tipo blob (para el video)
                });
                const videoBlob = new Blob([response.data], { type: 'video/mp4' }); // Crea un blob a partir de la respuesta
                this.videoURL = URL.createObjectURL(videoBlob); // Crea una URL para el blob
                this.video = true; // Indica que hay un video disponible
            } catch (error) {
                console.log(error); // Maneja los errores en la consola
            } finally {
                this.isLoading = false; // Indica que la carga ha finalizado
            }
        }
    },
    mounted() {
        document.title = "Reproductor"; // Establece el título de la página
        const tokenData = JSON.parse(localStorage.getItem('token')); // Obtiene el token de localStorage
        if ((VerifyToken(tokenData))) { // Verifica si el token es válido
            this.$router.push('/error'); // Redirige a la página de error si el token no es válido
        }
        this.obtenerVideo(this.$route.params.id); // Obtiene el video por su ID al cargar el componente
    }
})
</script>
<style scoped>
.container {
    color: white;
    background-color: #005883;
}

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