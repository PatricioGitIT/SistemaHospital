<template>
    <!-- Contenedor del reproductor de video -->
    <section class="video-container ">
        <!-- Etiqueta de video con URL dinámica y controles de reproducción -->
        <video controls>
            <!-- Fuente del video con URL dinámica y tipo de archivo -->
            <source :src="videoURL" type="video/mp4">
            <!-- Mensaje de respaldo para navegadores que no soportan videos MP4 -->
            Tu navegador no soporta la reproducción de videos MP4
        </video>
    </section>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Reproductor', // Nombre del componente
    props: {
        videoURL: {
            type: String,
            required: true,
        },
    },
})
</script>

<style scoped>
.video-container {
    position: relative; /* Posición relativa para los elementos internos */
    width: 90%; /* Ajusta el ancho para mantener la relación de aspecto */
    height: 0; /* Altura inicial en 0 para calcularla dinámicamente */
    padding-top: 46%; /* Relación de aspecto 16:9 */
    margin: 0 auto; /* Centra el contenedor horizontalmente */
    overflow: hidden; /* Evita que el video se desborde */
}

.video-container video {
    position: absolute; /* Posición absoluta para cubrir todo el contenedor */
    top: 0; /* Posición desde la parte superior del contenedor */
    left: 0; /* Posición desde la parte izquierda del contenedor */
    width: 100%; /* Ancho del video al 100% del contenedor */
    height: 100%; /* Altura del video al 100% del contenedor */
    object-fit: cover; /* Ajusta el tamaño del video para cubrir completamente el contenedor */
}
</style>
