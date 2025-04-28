<template>
    <!-- Contenedor principal de las tarjetas de video -->
    <main class="cards d-flex flex-wrap gap-5 justify-content-center row-cols-5">
        <!-- Iteración sobre cada video para mostrarlo en una tarjeta -->
        <section class="card doc-card" v-for="video in videos" style="width: 10rem;">
            <!-- Ícono de video -->
            <span class="material-icons doc-icon">movie</span>
            <div class="card-body">
                <!-- Título del video -->
                <h5 class="card-title" style="color:black;">{{ video.nombre }}</h5>
                <!-- Botones de acción -->
                <div class="d-flex flex-column gap-1">
                    <!-- Enlace a la página de reproductor de video -->
                    <router-link
                        :to="{ name: 'Reproductor', params: { id: video.id, nombre: video.nombre, descripcion: video.descripcion, url: video.url } }"
                        class="btn btn-primary main-btn">Ver</router-link>
                    <!-- Botón para eliminar el video -->
                    <button v-if="mostrarBotonEliminar" class="btn btn-danger"
                        @click="eliminarVideo(video.id)">Eliminar</button>
                </div>
            </div>
        </section>
    </main>
</template>

<script>
import { defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
    name: 'Videos',
    props: ['videos'],
    data() {
        return {
            mostrarBotonEliminar: false
        }
    },
    async mounted() {
        try {
            // Obtener token de autenticación del almacenamiento local
            const token = JSON.parse(localStorage.getItem('token'))
            const tokenData = token.token
            // Obtener el rol del usuario desde la API
            const apiurl = window.env.API_URL
            const response = await axios.get(`${apiurl}/getRol`, {
                headers: {
                    authorization: tokenData
                }
            })
            // Mostrar botón de eliminar si el usuario tiene rol 1 (administrador)
            if (response.data === 1) {
                this.mostrarBotonEliminar = true
            }
        } catch (error) {
            console.log(error)
        }
    },
    methods: {
        async eliminarVideo(id) {
            try {
                // Obtener token de autenticación del almacenamiento local
                const token = JSON.parse(localStorage.getItem('token'))
                const apiurl = window.env.API_URL
                // Enviar solicitud para eliminar el video mediante su ID
                const response = await axios.delete(`${apiurl}/videos/${id}`, {
                    headers: {
                        authorization: token.token
                    }
                })
                // Mostrar mensaje de éxito al eliminar el video
                alert('El video ha sido eliminado')
            } catch (error) {
                // Mostrar mensaje de error en caso de fallo al eliminar el video
                alert(error.response.data)
            }
        }
    }
})
</script>

<style scoped>
.doc-icon {
    margin: auto;
    font-size: 4rem;
}

.doc-card {
    border: 2px solid black;
}

.main-btn {
    border: 1px solid #ED6E00;
    background-color: #ED6E00 !important;
}

.main-btn:active {
    border: 1px solid #FD9D4A;
}

.main-btn:hover {
    border: 1px solid #FD9D4A;
}
</style>
