<template>
    <!-- Renderiza el componente Navbar -->
    <Navbar />
    <!-- Muestra un spinner de carga mientras los datos están siendo cargados -->
    <article v-if="isLoading">
        <div class="d-flex justify-content-center">
            <div class="spinner-grow text-primary" role="status">
                <span class="sr-only"></span>
            </div>
        </div>
    </article>
    <!-- Muestra los detalles del usuario si no está cargando y hay datos del usuario -->
    <article v-show="!isLoading && user.length > 0" class="jumbotron jumbotron-fluid">
        <!-- Encabezado de la sección de usuario -->
        <section class="container-md d-flex align-items-center w-75">
            <!-- Icono de usuario -->
            <aside class="mr-3"><span class="material-icons icon">manage_accounts</span></aside>
            <div class="row g-3">
                <!-- Título "Usuario" -->
                <h3 class="display-4">Usuario</h3>
                <!-- Detalles del usuario -->
                <template v-if="user[0]"> <!-- Comprobación adicional para verificar si hay un usuario -->
                    <p class="lead">rut: {{ user[0].id }}</p>
                    <p class="lead">nombre: {{ user[0].nombre }}</p>
                    <p class="lead">apellido paterno: {{ user[0].apellidopaterno }}</p>
                    <p class="lead">apellido materno: {{ user[0].apellidomaterno }}</p>
                    <p class="lead">correo: {{ user[0].email }}</p>
                    <p class="lead">creado el: {{ user[0].feccreacion }}</p>
                    <p class="lead">expira el: {{ user[0].expiracion }}</p>
                    <p class="lead">rol que tiene: {{ user[0].rol }}</p>
                    <p class="lead">registrado por: {{ user[0].creador }}</p>
                </template>
            </div>
        </section>
        <!-- Sección de acciones para el usuario -->
        <article class="container d-flex flex-column align-items-center w-75">
            <!-- Título de las acciones -->
            <h1>Que desea hacer con el usuario?</h1>
            <!-- Botones para realizar acciones -->
            <div class="cards d-flex flex-wrap gap-5 justify-content-center row-cols-5">
                <!-- Botón para eliminar usuario -->
                <section class="card User">
                    <section class="card-body">
                        <h5 class="card-title">Eliminar usuario</h5>
                        <div class="d-flex flex-column gap-1">
                            <button type="button" class="btn btn-danger" @click="eliminarUsuario">Eliminar</button>
                        </div>
                    </section>
                </section>
                <!-- Botón para modificar usuario -->
                <section class="card User">
                    <section class="card-body">
                        <h5 class="card-title">Modificar Usuario</h5>
                        <div class="d-flex flex-column gap-1">
                            <button type="button" class="btn custom-button"
                                @click="mostrarFormulario">Modificar</button>
                        </div>
                    </section>
                </section>
                <!-- Botón para ver la bitácora del usuario -->
                <section class="card User">
                    <section class="card-body">
                        <h5 class="card-title">Visualizar Bitacora</h5>
                        <div class="d-flex flex-column gap-1">
                            <button type="button" class="btn btn-success" @click="MostrarBitacora">Ver</button>
                        </div>
                    </section>
                </section>
            </div>
        </article>
        <!-- Componente para modificar el usuario -->
        <article v-if="ModificarUsuario">
            <userForm :schema="formSchema" :UserID="user[0].id" />
        </article>
        <!-- Componente para mostrar la bitácora del usuario -->
        <article v-if="verBitacora">
            <BitacoraCard :bitacoras="bitacora" />
        </article>
    </article>
</template>
<script>
import { defineComponent } from 'vue';
import Navbar from '../components/navbar.vue';
import userForm from '../components/Forms/userForm.vue'
import BitacoraCard from '../components/Cards/BitacoraCard.vue';
import { VerifyToken } from '../utils/utils';
import * as Yup from 'yup'; // Importación de Yup para validación de esquemas
import axios from 'axios'; // Importación de axios para hacer solicitudes HTTP
import roles from '../json/roles.json'; // Importación de roles desde un archivo JSON

export default defineComponent({
    name: 'Modificar Usuario', // Nombre del componente
    components: {
        Navbar,
        userForm,
        BitacoraCard
    },
    data() {
        const formSchema = { // Esquema para la validación del formulario
            fields: [
                // Definición de campos del formulario con sus respectivas reglas de validación
            ],
        };
        return {
            isLoading: true, // Indica si se está cargando la información del usuario
            ModificarUsuario: false, // Indica si se está modificando el usuario
            verBitacora: false, // Indica si se está visualizando la bitácora del usuario
            user: [], // Almacena la información del usuario
            formSchema, // Esquema del formulario
            bitacora: [] // Almacena la bitácora del usuario
        }
    },
    async mounted() {
        document.title = 'Modificar usuario'; // Establece el título de la página
        const token = JSON.parse(localStorage.getItem('token')); // Obtiene el token de localStorage
        if (VerifyToken(token)) { // Verifica si el token es válido
            this.$router.push('/error'); // Redirige a la página de error si el token no es válido
        } else {
            try {
                const id = this.$route.params.id; // Obtiene el ID del usuario de los parámetros de la ruta
                const apiurl = window.env.API_URL; // Obtiene la URL de la API desde el entorno
                const response = await axios.get(`${apiurl}/usuario?id=${id}`, { // Realiza una solicitud GET para obtener la información del usuario
                    headers: {
                        authorization: token.token // Agrega el token de autorización en la cabecera
                    }
                });
                this.user = response.data; // Almacena la información del usuario
                this.reemplazarRolconNombre(this.user, roles); // Reemplaza el ID del rol con el nombre del rol
            } catch (error) {
                console.error(error); // Muestra un error en la consola si ocurre un error durante la solicitud
            } finally {
                this.isLoading = false; // Establece isLoading en falso una vez que se ha completado la solicitud
            }
        }
    },
    methods: {
        mostrarFormulario() {
            // Cambia el estado de ModificarUsuario para mostrar u ocultar el formulario de modificación
            this.ModificarUsuario = !this.ModificarUsuario;
        },
        async MostrarBitacora() {
            // Muestra u oculta la bitácora del usuario
            this.verBitacora = !this.verBitacora;
            if (this.verBitacora) {
                try {
                    const token = JSON.parse(localStorage.getItem('token')); // Obtiene el token de localStorage
                    const id = this.$route.params.id; // Obtiene el ID del usuario de los parámetros de la ruta
                    const apiurl = window.env.API_URL; // Obtiene la URL de la API desde el entorno
                    const result = await axios.get(`${apiurl}/bitacora/${id}`, { // Realiza una solicitud GET para obtener la bitácora del usuario
                        headers: {
                            authorization: token.token // Agrega el token de autorización en la cabecera
                        }
                    });
                    this.bitacora = result.data; // Almacena la bitácora del usuario
                } catch (error) {
                    // Maneja los errores de la solicitud
                    if (error.response) {
                        alert('Hubo un error del servidor:', error.response.data.message); // Muestra un mensaje de error del servidor
                    } else if (error.request) {
                        console.log(error); // Muestra el error en la consola si el servidor no responde
                        alert('Hubo un erro de red, el servidor no responde'); // Muestra un mensaje si hay un error de red
                    } else {
                        alert('Hubo un error desconocido'); // Muestra un mensaje si ocurre un error desconocido
                    }
                }
            }
        },
        async eliminarUsuario() {
            // Elimina al usuario
            const FormdataJson = { estado: false }; // Datos para la solicitud de eliminación
            const id = this.$route.params.id; // Obtiene el ID del usuario de los parámetros de la ruta
            const token = JSON.parse(localStorage.getItem('token')); // Obtiene el token de localStorage
            try {
                const apiurl = window.env.API_URL; // Obtiene la URL de la API desde el entorno
                const response = await axios.patch(`${apiurl}/usuarios/${id}`, FormdataJson, { // Realiza una solicitud PATCH para eliminar al usuario
                    headers: {
                        authorization: token.token // Agrega el token de autorización en la cabecera
                    }
                });
                alert('Usuario eliminado'); // Muestra una alerta cuando se elimina al usuario con éxito
            } catch (error) {
                console.log(error); // Muestra el error en la consola si ocurre un error durante la solicitud
            }
        },
        reemplazarRolconNombre(usuario, roles) {
            // Reemplaza el ID del rol del usuario con el nombre del rol
            let usuarioInicial = roles.find(item => item.id === usuario[0].rol); // Busca el rol del usuario en la lista de roles
            if (usuarioInicial) {
                usuario[0].rol = usuarioInicial.rol; // Reemplaza el ID del rol con el nombre del rol
            }
        }
    }
})
</script>

<style scoped>
.container-md {
    background-color: #005883;
    color: white;
}

.icon {
    margin: auto;
    font-size: 9.375rem;
}

.User {
    background-color: #005883;
    width: 24rem;
}

.card-title {
    color: white;
}

.custom-button {
    background-color: #ED6E00;
    color: white;
}

.custom-button:active {
    background-color: #b65700 !important;
    color: white !important;
}

.custom-button:hover {
    color: white;
    background-color: #b65700;
}
</style>