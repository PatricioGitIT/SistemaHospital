<template>
    <!-- Navbar component -->
    <Navbar />

    <!-- Contenedor principal del formulario -->
    <article class="form-content">
        <h2>Subir Video</h2>
        <!-- Contenedor para el formulario -->
        <section class="container-md d-flex align-items-center w-75">
            <!-- Icono -->
            <aside class="mr-3"><span class="material-icons icon">movie</span></aside>

            <!-- Formulario -->
            <Form class="row g-3" :validation-schema="validationSchema" @submit="submitForm">
                <!-- Iteración sobre los campos definidos en el esquema -->
                <div class="mb-3 col-12" v-for="{ as, name, label, ...attrs } in schema.fields" :key="name">
                    <!-- Etiqueta del campo -->
                    <label :for="name" class="form-label">{{ label }}</label>

                    <!-- Campo de entrada (input, textarea, file) según el tipo -->
                    <input v-if="as === 'file'" type="file" :id="name" :class="attrs.class" :name="name"
                        @change="handleFileChange($event)">
                    <Field :as="as" :id="name" :class="attrs.class" :name="name" v-model="formData[name]" />

                    <!-- Mensaje de error asociado al campo -->
                    <ErrorMessage :name="name" class="error-message" />
                </div>

                <!-- Selector de rol que puede visualizar el video -->
                <div class="mb-3 col-12">
                    <label class="white-text" for="Roles">Seleccionar Rol que puede visualizarlo</label>
                    <select v-model="formData.selectedRol" class="form-control" id="Rol">
                        <option v-for="rol in roles" :value="rol.id" :key="rol.id">{{ rol.nombre }}</option>
                    </select>
                </div>

                <!-- Botón de envío del formulario -->
                <div class="mb-3 col-12">
                    <button type="submit" class="btn btn-primary main-btn">Subir</button>
                </div>
            </Form>
        </section>
    </article>
</template>

<script>
import { defineComponent } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate'; // Componentes de VeeValidate
import * as Yup from 'yup'; // Importación de Yup para validación de esquema
import rolesInfo from '../../json/usuarios.json'; // Información de roles
import axios from 'axios'; // Importación de Axios para realizar solicitudes HTTP

export default defineComponent({
    name: 'VideosForm',
    components: {
        Form,
        Field,
        ErrorMessage,
    },
    props: {
        schema: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            formData: {
                name: '',
                description: '',
                selectedRol: null,
                url: '',
                file: null
            },
            roles: rolesInfo, // Información de roles disponibles
            // Validación del esquema del formulario utilizando Yup
            validationSchema: Yup.object().shape({
                name: Yup.string().required('Campo Obligatorio'),
                description: Yup.string().required('Campo Obligatorio').max(255, 'no puede superar los 255 caracteres'),
                url: Yup.string().test('is-google-drive-url', 'El enlace debe ser una URL de Google Drive', (value) => {
                    if (!value) return false; // No permitir valores nulos o vacíos
                    return /^(https?\:\/\/)?(drive\.google\.com)\/.+$/.test(value); // Expresión regular para enlaces de Google Drive
                })
            })
        };
    },

    methods: {
        // Manejo de cambio de archivo
        handleFileChange(event) {
            const selectedFile = event.target.files[0];
            const maxSizeInBytes = 2500 * 1024 * 1024 // 250 MB en bytes
            if (!selectedFile) {
                return
            }
            // Verificación de tamaño y tipo del archivo seleccionado
            if (selectedFile.size > maxSizeInBytes) {
                alert('El tamaño del video excede el límite permitido (250 MB)')
                event.target.value = '';
                return
            }
            if (!selectedFile.type || !selectedFile.type.includes('video/mp4')) {
                alert('el archivo debe ser un Video en formato MP4')
                event.target.value = '';
                return
            }
            this.formData.file = selectedFile;
        },
        // Envío del formulario
        async submitForm() {
            if (this.formData.file === null) {
                alert('Agregar video en formato MP4')
                return
            } else if (this.formData.selectedRol === null) {
                alert('Debe de agregar quienes lo van a ver')
                return
            }
            const token = JSON.parse(localStorage.getItem('token'))
            const formulario = new FormData()
            formulario.append('name', this.formData.name)
            formulario.append('descripcion', this.formData.description)
            formulario.append('file', this.formData.file)
            formulario.append('url', this.formData.url)
            formulario.append('selectedRol', this.formData.selectedRol)
            try {
                const apiurl = window.env.API_URL
                // Envío de datos al servidor utilizando Axios
                const result = await axios.post(`${apiurl}/video`, formulario, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        authorization: token.token
                    }
                })
                alert(result.data)
                this.$router.push('/SearchVideo')
            } catch (error) {
                console.log(error)
                alert('Hubo un problema la subir el video intentarlo más tarde')
            }
        }
    }
});
</script>

<style scoped>
.main-btn {
    border: 1px solid #ED6E00;
    background-color: #ED6E00 !important;
}

.icon {
    margin: auto;
    font-size: 9.375rem;
}

.custom-file-input,
.white-text {
    color: white;
}
</style>