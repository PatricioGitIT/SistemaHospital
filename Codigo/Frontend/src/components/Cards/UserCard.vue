<template>
    <!-- Contenedor principal de las tarjetas de usuario -->
    <main class="cards d-flex flex-wrap gap-5 justify-content-center row-cols-5">
        <!-- Iteración sobre cada usuario para mostrarlo en una tarjeta -->
        <section class="card doc-card" v-for="usuario in usuarios" style="width: 10rem;">
            <!-- Ícono de usuario -->
            <span class="material-icons doc-icon">person</span>
            <div class="card-body">
                <!-- Nombre del usuario -->
                <h5 class="card-title" style="color:black;">{{ usuario.nombre }}</h5>
                <!-- Rut del usuario -->
                <h6 class="card-subtitle" style="color:black;">Rut: {{ usuario.id }}</h6>
                <!-- Botón para modificar el usuario -->
                <div class="d-flex flex-column gap-1">
                    <!-- Enlace a la página de modificación del usuario -->
                    <router-link :to="{ name: 'Modificar Usuario', params: { id: usuario.id } }"
                        class="btn btn-primary main-btn">Modificar</router-link>
                </div>
            </div>
        </section>
    </main>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Usuario',
    props: ['usuarios']
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
