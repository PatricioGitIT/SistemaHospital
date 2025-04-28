<template>
    <!-- Contenedor principal para las tarjetas de bitácoras -->
    <main class="cards d-flex flex-wrap gap-5 justify-content-center row-cols-5">
        <!-- Itera sobre cada bitácora y muestra una tarjeta para cada una -->
        <section class="card doc-card" v-for="bitacora in bitacoras" style="width: 10rem;">
            <!-- Icono de bitácora -->
            <span class="material-icons doc-icon">
                history
            </span>
            <!-- Contenido de la tarjeta -->
            <div class="card-body">
                <!-- Título de la bitácora -->
                <h5 class="card-title" style="color:black;">{{ bitacora.tipoactividad }}</h5>
                <!-- Fecha de la bitácora -->
                <h6 class="card-subtitle" style="color:black;">Fecha: {{ bitacora.fecha }}</h6>
                <!-- Hora de la bitácora -->
                <h6 class="card-subtitle" style="color:black;">Hora: {{ bitacora.hora }}</h6>
            </div>
        </section>
    </main>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Bitacoras', // Nombre del componente
    props: ['bitacoras'], // Propiedad que recibe las bitácoras como arreglo
})
</script>

<style scoped>
/* Estilos para el icono de la tarjeta */
.doc-icon {
    margin: auto; /* Centra el icono horizontalmente */
    font-size: 4rem; /* Tamaño del icono */
}

/* Estilos para la tarjeta de bitácora */
.doc-card {
    border: 2px solid black; /* Borde sólido de 2px en color negro */
}
</style>
