<template>
    <!-- Contenedor principal del formulario -->
    <article class="form-content">
        <!-- Sección para el registro de un nuevo usuario -->
        <section class="signup container-md w-75">
            <!-- Título del formulario -->
            <h2 class="white-text">Registrar un nuevo usuario</h2>
            <!-- Formulario de registro -->
            <Form class="row g-3" :validation-schema="validationSchema" @submit="submitForm">
                <!-- Iterar sobre los campos del formulario -->
                <div class="mb-3 col-12" v-for="{ as, name, label, ...attrs } in schema.fields" :key="name">
                    <!-- Etiqueta del campo -->
                    <label :for="name" class="form-label">{{ label }}</label>
                    <!-- Campo de entrada -->
                    <Field :as="as" :id="name" :class="attrs.class" :name="name" v-bind="attrs" v-model="formData[name]" />
                    <!-- Mensaje de error asociado al campo -->
                    <ErrorMessage :name="name" class="error-message" />
                </div>
                <!-- Campo para seleccionar el rol -->
                <div class="col-12">
                    <label class="white-text" for="Roles">Seleccionar Rol</label>
                    <!-- Lista desplegable para seleccionar el rol -->
                    <select v-model="formData.selectedRol" class="form-control" id="Rol">
                        <!-- Iterar sobre los roles disponibles -->
                        <option v-for="rol in roles" :value="rol.id" :key="rol.id">{{ rol.rol }}</option>
                    </select>
                </div>
                <!-- Botón para enviar el formulario -->
                <div class="col-12">
                    <button type="submit" class="btn btn-primary main-btn" style="border:1px solid #ED6E00; background-color: #ED6E00 !important;">Registrar</button>
                </div>
            </Form>
        </section>
    </article>
</template>
  
<script>
import { defineComponent } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate'; // Importar componentes de vee-validate
import * as Yup from 'yup'; // Importar Yup para la validación del formulario
import axios from 'axios'; // Importar axios para realizar solicitudes HTTP
import rolesInfo from '../../json/roles.json'; // Importar información de roles desde un archivo JSON

export default defineComponent({
    name: 'RegistroForm',
    components: {
        Form,
        Field,
        ErrorMessage,
    },
    props: {
        schema: { // Propiedad para el esquema del formulario
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            formData: { // Datos del formulario
                rut: '', // Rut del usuario
                name: '', // Nombre del usuario
                surname: '', // Apellido paterno del usuario
                secondSurname: '', // Apellido materno del usuario
                expiracion: '', // Fecha de expiración
                email: '', // Correo electrónico del usuario
                password: '', // Contraseña del usuario
                confirmPassword: '', // Confirmación de contraseña del usuario
                selectedRol: null // Rol seleccionado
            },
            roles: rolesInfo, // Lista de roles disponibles
            validationSchema: Yup.object().shape({ // Esquema de validación del formulario con Yup
                rut: Yup.string().required('Campo Obligatorio').max(8, "El rut no puede superar los 8 digitos").min(7, "el rut debe tener minimo 7 digitos"),
                name: Yup.string().required('Campo Obligatorio'),
                surname: Yup.string().required('Campo Obligatorio'),
                secondSurname: Yup.string().required('Campo Obligatorio'),
                expiracion: Yup.string().required('Campo Obligatorio').matches(/^(0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/,
                    'Debe ser en formato dd/mm/yyyy'),
                email: Yup.string().email('Ingresar un Correo Valido').required('Campo Obligatorio'),
                password: Yup.string()
                    .required('Campo Obligatorio')
                    .matches(
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                        'La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra mayúscula, una letra minúscula y un número'
                    ),
                confirmPassword: Yup.string()
                    .required('Campo obligatorio')
                    .oneOf([Yup.ref('password')], 'Las contraseñas deben ser iguales')
            })
        };
    },
    methods: {
        submitForm() {
            if (this.formData.selectedRol === null) {
                alert('Se debe asignar un rol'); // Alerta si no se ha seleccionado un rol
            } else {
                try {
                    const token = JSON.parse(localStorage.getItem('token')); // Obtener el token del almacenamiento local
                    const apiurl= window.env.API_URL; // URL de la API obtenida desde las variables de entorno
                    // Realizar una solicitud POST para registrar un nuevo usuario
                    const verify = axios.post(`${apiurl}/register`, {
                        rut: this.formData.rut, // Rut del usuario
                        name: this.formData.name, // Nombre del usuario
                        firstSurname: this.formData.surname, // Apellido paterno del usuario
                        secondSurname:this.formData.secondSurname, // Apellido materno del usuario
                        email:this.formData.email, // Correo electrónico del usuario
                        password:this.formData.password, // Contraseña del usuario
                        rol: this.formData.selectedRol, // Rol seleccionado
                        expiracionString: this.formData.expiracion, // Fecha de expiración
                        token: token.token // Token de autenticación
                    });
                    alert('Los datos fueron enviados correctamente'); // Alerta de éxito
                } catch (error) {
                    if(error.response){ // Si la respuesta contiene datos
                        alert('Hubo un error en enviar los datos: ' + error.response.data.message); // Alerta de error con el mensaje de respuesta
                    } else if(error.request){ // Si no se recibe respuesta del servidor
                        alert('Hubo error de red: No se recibió respuesta del servidor '); // Alerta de error de red
                    }
                }
                this.$router.push('/Users'); // Redireccionar a la página de usuarios después de registrar exitosamente
            }
        }
    }
});
</script>  
<style scoped>
/* Estilos específicos para este componente */
.white-text {
    color: white; /* Define el color del texto como blanco */
}
</style>
