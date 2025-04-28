<template>
    <Navbar />
    <main>
        <!-- Se incluye el formulario para subir videos, pasándole el esquema de validación como propiedad -->
        <VideosForm :schema="formSchema" />
    </main>
</template>

<script>
import { defineComponent } from 'vue';
import VideosForm from '../components/Forms/VideosForm.vue'; // Importa el componente de formulario para videos
import Navbar from '../components/navbar.vue'; // Importa el componente de la barra de navegación
import * as Yup from 'yup'; // Importa Yup para definir el esquema de validación

export default defineComponent({
    name: 'SubirVideoView',
    components: {
        Navbar,
        VideosForm
    },
    mounted() {
        // Establece el título de la página
        document.title = 'Subir Video'
    },
    data() {
        // Define el esquema de validación para el formulario de subir video
        const formSchema = {
            fields: [
                {
                    label: 'Nombre del video',
                    name: 'name',
                    as: 'input',
                    class: 'form-control',
                    rules: Yup.string().required('Campo Obligatorio')
                },
                {
                    label: 'Descripción',
                    name: 'description',
                    as: 'textarea',
                    class: 'form-control',
                    rules: Yup.string().required('Campo Obligatorio').max(255, 'no puede superar los 255 caracteres')
                },
                {
                    label: 'Url del video',
                    name: 'url',
                    as: 'input',
                    class: 'form-control',
                    rules: Yup.string().test('is-google-drive-url', 'El enlace debe ser una URL de Google Drive', (value) => {
                        if (!value) return false; // No permitir valores nulos o vacíos
                        return /^(https?\:\/\/)?(drive\.google\.com)\/.+$/.test(value); // Expresión regular para enlaces de Google Drive
                    })
                },
                {
                    label: 'Video a subir (En formato MP4)',
                    name: 'file',
                    as: 'file',
                    class: 'custom-file-input',
                },
            ],
        };
        return {
            formSchema // Retorna el esquema de validación como dato del componente
        };
    }
})
</script>