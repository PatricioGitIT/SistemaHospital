<template>
    <!-- Renderiza el componente Navbar -->
    <Navbar />
    <!-- Contenedor principal con tarjetas para mostrar los distintos ámbitos -->
    <main class="cards d-flex flex-wrap gap-5 justify-content-center row-cols-5">
        <!-- Itera sobre cada ámbito y renderiza una tarjeta para cada uno -->
        <section class="card" v-for="ambito in ambitos" :key="ambito.id"
            :style="{ width: '27.5rem', backgroundColor: ambito.id > ciertoId ? '#ED6E00' : '#005883' }">
            <!-- Icono del ámbito -->
            <span class="material-icons icon">{{ ambito.icono }}</span>
            <div class="card-body">
                <!-- Título del ámbito -->
                <h5 class="card-title">{{ ambito.nombre }}</h5>
                <div class="d-flex flex-column gap-1">
                    <!-- Enlace para acceder a los documentos del ámbito -->
                    <router-link :to="{ name: 'Documentos ambito', params: { id: ambito.id } }"
                        class="btn btn-primary main-btn">Acceder</router-link>
                </div>
            </div>
        </section>
    </main>
</template>

<script>
import { defineComponent } from 'vue'; // Importa la función defineComponent de Vue
import Navbar from '../components/navbar.vue'; // Importa el componente Navbar
import ambitosData from '../json/ambitos.json'; // Importa los datos de los ámbitos
import { VerifyToken } from '../utils/utils'; // Importa la función VerifyToken para verificar el token de autenticación

export default defineComponent({
    name: 'MenuView', // Nombre del componente
    components: {
        Navbar,
    },
    data() {
        return {
            ciertoId: 13, // ID a partir del cual se cambia el color de fondo de las tarjetas
            ambitos: [] // Arreglo que contendrá los ámbitos
        }
    },
    mounted() {
        document.title = "Menú"; // Establece el título del documento HTML
        const tokenData = JSON.parse(localStorage.getItem('token')); // Obtiene los datos del token del almacenamiento local
        // Verifica si el token es válido, de lo contrario redirige a la página de error
        if ((VerifyToken(tokenData))) {
            this.$router.push('/error');
        }
        this.ambitos = ambitosData; // Asigna los datos de los ámbitos a la variable ambitos
    }
});
</script>

<style scoped>
.card-body {
    color: white !important;
}

.icon {
    margin: auto;
    font-size: 9.375rem;

}

.main-btn {
    background-color: #0085FF !important;
}
</style>
