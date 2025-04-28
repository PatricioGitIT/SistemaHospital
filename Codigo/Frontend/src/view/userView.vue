<template>
    <!-- Barra de navegación -->
    <main>
        <section>
            <Navbar />
        </section>
        <article class="cards d-flex flex-wrap gap-5 justify-content-center row-cols-5">
            <!-- Sección para agregar usuarios -->
            <section class="card" style="width: 27.5rem; background-color: #005883;">
                <!-- Icono para agregar usuarios -->
                <span class="material-icons icon">person_add</span>
                <div class="card-body">
                    <!-- Enlace para registrar un nuevo usuario -->
                    <a href="/registrar" class="btn btn-primary">Registrar Nuevo Usuario</a>
                </div>
            </section>
            <!-- Sección para buscar usuarios -->
            <section class="card" style="width: 27.5rem; background-color: #005883;">
                <section class="card-body">
                    <!-- Formulario para buscar usuarios -->
                    <form class="formulario">
                        <div class="form-group">
                            <!-- Campo de entrada para ingresar el nombre de usuario -->
                            <input class="form-control" id="PalabraClave" placeholder="Nombre" v-model="palabraClave">
                        </div>
                        <div class="text-center">
                            <!-- Enlace para realizar la búsqueda de usuarios -->
                            <router-link :to="{ name: 'Buscar Usuarios', params: { name: palabraClave } }"
                                class="btn btn-primary">Buscar</router-link>
                        </div>
                    </form>
                </section>
            </section>
        </article>
    </main>
</template>

<script>
import { defineComponent } from 'vue';
import Navbar from '../components/navbar.vue';
import { VerifyToken } from '../utils/utils.js';

export default defineComponent({
    name: 'Gestion de usuarios',
    components: {
        Navbar,
    },
    mounted() {
        // Establecer el título de la página
        document.title = 'Gestión de usuarios';

        // Verificar si hay un token de autenticación almacenado en localStorage
        const tokenData = JSON.parse(localStorage.getItem('token'));

        // Redirigir a la página de error si el token no es válido
        if ((VerifyToken(tokenData))) {
            this.$router.push('/error');
        }
    },
    data() {
        return {
            // Variable para almacenar la palabra clave ingresada para buscar usuarios
            palabraClave: ''
        };
    }
})
</script>

<style scoped>
/* Estilos CSS específicos para este componente */
.icon {
    margin: auto;
    font-size: 9.375rem;
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

.formulario {
    margin-top: 25px;
}
</style>
