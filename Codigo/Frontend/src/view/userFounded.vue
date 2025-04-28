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
        <!-- Sección para mostrar los usuarios encontrados -->
        <article v-if="users.length > 0">
            <!-- Componente de tarjeta de usuario -->
            <UserCard :usuarios="users" />
        </article>

        <!-- Sección para mostrar cuando no hay usuarios encontrados -->
        <article v-else>
            <section class="jumbotron">
                <h1 class="display-4"><span class="material-icons icon">warning</span>Ha ocurrido un problema</h1>
                <p class="lead">Lamentablemente no hay usuarios para mostrar</p>
                <hr class="my-4">
                <p>Para volver a la página anterior haz click en el botón</p>
                <a href='/Users' class="btn btn-primary btn-lg">Volver</a>
            </section>
        </article>
    </main>
</template>

<script>
import { defineComponent } from 'vue';
import UserCard from '../components/Cards/UserCard.vue';
import Navbar from '../components/navbar.vue';
import axios from 'axios';
import { VerifyToken } from '../utils/utils';

export default defineComponent({
    name: 'UserFounded',
    components: {
        Navbar,
        UserCard,
    },
    data() {
        return {
            users: [], // Arreglo para almacenar los usuarios encontrados
            isLoading: true, // Indicador de carga inicialmente activo
        };
    },
    async mounted() {
        document.title = 'Mostrar Usuarios'; // Establecer el título de la página

        // Obtener el nombre de usuario de los parámetros de la ruta
        const nombreUsuarios = this.$route.params.name;

        // Verificar el token de autenticación almacenado en localStorage
        const token = JSON.parse(localStorage.getItem('token'))

        // Si el token es válido, hacer la solicitud para obtener los usuarios
        if (VerifyToken(token.data)) {
            try {
                // Obtener la URL de la API desde las variables de entorno
                const apiurl= window.env.API_URL;

                // Hacer la solicitud GET para obtener los usuarios que coinciden con el nombre
                const response = await axios.get(`${apiurl}/usuarios?name=${nombreUsuarios}`, {
                    headers: {
                        authorization: `${token.token}`
                    }
                });

                // Asignar los usuarios encontrados al arreglo de datos
                this.users = response.data;
            }
            catch (error) {
                // Manejar cualquier error durante la solicitud
                console.error('Hubo un problema al buscar a los usuarios', error);
            }
            finally {
                // Desactivar el indicador de carga
                this.isLoading = false;
            }
        } else {
            // Si el token no es válido, redirigir a la página de error
            this.$router.push('/error');
        }
    }
});
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
