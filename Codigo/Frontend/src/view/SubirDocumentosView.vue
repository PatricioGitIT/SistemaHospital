<template>
    <Navbar /> <!-- Componente de barra de navegación -->
    <main>
        <!-- Componente de formulario para subir documentos -->
        <DocumentosForm :schema="formSchema" />
    </main>
</template>

<script>
import { defineComponent } from 'vue';
import DocumentosForm from '../components/Forms/DocumentosForm.vue'; // Componente de formulario para documentos
import Navbar from '../components/navbar.vue'; // Componente de barra de navegación
import * as Yup from 'yup'; // Librería Yup para validación de esquemas
import { VerifyToken } from '../utils/utils'; // Función para verificar el token de autenticación

export default defineComponent({
    name: 'SubirDocumentoView', // Nombre del componente
    components: {
        Navbar, // Componente de barra de navegación
        DocumentosForm, // Componente de formulario para documentos
    },
    mounted() {
        document.title = 'Subir Documento'; // Establece el título de la página

        const tokenData = JSON.parse(localStorage.getItem('token')); // Obtiene el token de localStorage
        if((VerifyToken(tokenData))) { // Verifica si el token es válido
            this.$router.push('/error'); // Redirige a la página de error si el token no es válido
        }
    },
    data() {
        const formSchema = {
            fields: [
                {
                    label: 'ID del documento (en caso de no tener dejarlo en blanco)',
                    name: 'id',
                    as: 'input',
                    class: 'form-control',
                },
                {
                    label: 'Nombre del documento',
                    name: 'name',
                    as: 'input',
                    class: 'form-control',
                    rules: Yup.string().required('Campo Obligatorio'), // Validación: campo obligatorio
                },
                {
                    label: 'Documento a subir (En formato PDF)',
                    name: 'file',
                    as: 'file',
                    class: 'custom-file-input',
                },
            ],
        };
        return {
            formSchema // Esquema del formulario
        }
    },
})
</script>
