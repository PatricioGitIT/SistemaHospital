<template>
    <Navbar />
    <main v-if="isLoading">
        <div class="d-flex justify-content-center">
            <div class="spinner-grow text-primary" role="status">
                <span class="sr-only"></span>
            </div>
        </div>
    </main>
    <main v-show="!isLoading">
        <article v-if="documents.length > 0">
            <DocumentosCard :documentos="documents" />
        </article>
        <article v-else>
            <section class="jumbotron">
                <h1 class="display-4"><span class="material-icons icon">warning</span>Ha ocurrido un problema</h1>
                <p class="lead">Lamentablemente no hay documentos para mostrar</p>
                <hr class="my-4">
                <p>Para volver buscar otro documento haz click en el botón</p>
                <a href='/SearchDocuments' class="btn btn-primary btn-lg">Volver</a>
            </section>
        </article>
    </main>
</template>

<script>
import { defineComponent } from 'vue';
import DocumentosCard from '../components/Cards/DocumentosCard.vue'; // Importa el componente DocumentosCard
import Navbar from '../components/navbar.vue'; // Importa el componente Navbar
import { VerifyToken } from '../utils/utils'; // Importa la función VerifyToken desde el archivo utils.js
import ambitos from '../json/ambitos.json'; // Importa los datos de los ámbitos desde el archivo ambitos.json
import axios from 'axios'; // Importa axios para realizar solicitudes HTTP

export default defineComponent({
    name: 'DocumentosView', // Nombre del componente
    components: {
        Navbar,
        DocumentosCard,
    },
    data() {
        return {
            documents: [], // Arreglo para almacenar los documentos
            isLoading: true // Bandera para indicar si se están cargando los documentos
        };
    },
    methods: {
        reemplazarAmbitosconIniciales(arreglo, inicialesJSON) {
            arreglo.forEach(element => {
                let objetoInicial = inicialesJSON.find(item => item.id === element.ambito);
                if (objetoInicial) {
                    element.ambito = objetoInicial.iniciales; // Reemplaza el campo "ambito" del elemento con sus iniciales
                }
            });
        }
    },
    async mounted() {
        document.title = 'Mostrar Documentos'; // Establece el título del documento HTML

        const tokenData = JSON.parse(localStorage.getItem('token')); // Obtiene los datos del token almacenado en el localStorage
        if ((VerifyToken(tokenData))) { // Verifica si el token es válido
            this.$router.push('/error'); // Redirecciona a la página de error si el token no es válido
        }

        try {
            const url = window.env.API_URL; // Obtiene la URL base de la API desde el entorno
            const response = await axios.get(`${url}/documentos?=name${this.$route.params.name}&ambito=${this.$route.params.id}`, {
                headers: {
                    authorization: `${tokenData.token}`
                }
            }); // Realiza una solicitud GET para obtener los documentos

            this.documents = response.data; // Asigna los documentos obtenidos a la variable documents
            this.reemplazarAmbitosconIniciales(this.documents, ambitos); // Reemplaza los IDs de ámbitos con sus iniciales
        } catch (error) {
            console.error("Error fetching products:", error); // Maneja errores en la solicitud HTTP
        } finally {
            this.isLoading = false; // Actualiza isLoading a false una vez que se han cargado los documentos
        }
    },
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