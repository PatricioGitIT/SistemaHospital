<template>
    <!-- Sección principal que contiene las tarjetas de documentos -->
    <main class="cards d-flex flex-wrap gap-5 justify-content-center row-cols-5">
        <!-- Iteración sobre cada documento para mostrarlo en una tarjeta -->
        <section class="card doc-card" v-for="documento in documentos" style="width: 10rem;">
            <!-- Ícono del documento -->
            <span class="material-icons doc-icon">insert_drive_file</span>
            <div class="card-body">
                <!-- Información del documento -->
                <h6 class="card-subtitle" style="color:black;">Id: {{ documento.id }}</h6>
                <h5 class="card-title" style="color:black;">{{ documento.nombre }}</h5>
                <h6 class="card-subtitle" style="color:black;">Ámbito: {{ documento.ambito }}</h6>
                <!-- Botones para ver y eliminar el documento -->
                <div class="d-flex flex-column gap-1">
                    <button href="#" class="btn btn-primary main-btn doc-btn" style="border:1px solid  #ED6E00 ;
    background-color: #ED6E00 !important;" @click="abrirDocumento(documento.id)">Ver</button>
                    <!-- Botón para eliminar el documento (solo visible si se permite) -->
                    <button v-if="mostrarBotonEliminar" href="#" class="btn btn-danger"
                        @click="eliminarDocumento(documento.id)">Eliminar</button>
                </div>
            </div>
        </section>
    </main>
</template>

<script>
import { defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
    name: 'Documentos',
    props: ['documentos'],
    data() {
        return {
            mostrarBotonEliminar: false // Variable para controlar la visibilidad del botón de eliminar
        }
    },
    async mounted() {
        // Método ejecutado al cargar el componente
        try {
            const token = JSON.parse(localStorage.getItem('token'))
            const tokenData = token.token
            const apiurl = window.env.API_URL
            // Consulta al servidor para obtener el rol del usuario actual
            const response = await axios.get(`${apiurl}/getRol`, {
                headers: {
                    authorization: tokenData
                }
            })
            // Si el rol es 1 (administrador), se muestra el botón de eliminar documentos
            if (response.data === 1) {
                this.mostrarBotonEliminar = true
            }
        } catch (error) {
            console.log(error)
        }
    },
    methods: {
        // Método para abrir un documento en una nueva pestaña del navegador
        async abrirDocumento(id) {
            try {
                const token = JSON.parse(localStorage.getItem('token'))
                const tokendata = token.token
                const apiurl= window.env.API_URL
                // Petición al servidor para obtener el documento en formato blob
                const response = await axios.get(`${apiurl}/documentos/${id}`, {
                    responseType: 'blob',
                    headers:{
                        authorization:tokendata
                    }
                })
                // Creación de una URL local para el blob del documento y apertura en una nueva pestaña
                const blob = new Blob([response.data], { type: 'application/pdf' })
                const url = URL.createObjectURL(blob)
                window.open(url, '_blank')
            } catch (error) {
                console.error('No se pudo abrir el documento PDF', error)
                alert('El documento no se encuentra disponible')
            }
        },
        // Método para eliminar un documento
        async eliminarDocumento(id) {
            try {
                const token = JSON.parse(localStorage.getItem('token'))
                const tokendata = token.token
                const apiurl= window.env.API_URL
                // Petición al servidor para eliminar el documento
                const response = await axios.delete(`${apiurl}/documentos/${id}`,{
                    headers:{
                        authorization: tokendata
                    }
                })
                alert(response.data) // Muestra el mensaje de respuesta del servidor
            } catch (error) {
                alert(error.response.data) // Muestra el mensaje de error del servidor
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
</style>
