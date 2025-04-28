<template>
    <!-- Contenedor principal del formulario -->
    <article class="form-content">
        <!-- Sección para el registro de un nuevo usuario -->
        <section class="signup container-md w-75">
            <!-- Título del formulario -->
            <h2 class="white-text">Registrar un nuevo usuario</h2>

            <!-- Formulario de registro -->
            <Form class="row g-3" :validation-schema="validationSchema" @submit="submitForm">
                <!-- Campos del formulario -->
                <div class="mb-3 col-12">
                    <label for="rut" class="form-label">RUT</label>
                    <Field id="rut" name="rut" type="text" v-model="formData.rut" class="form-control" />
                    <ErrorMessage name="rut" class="error-message" />
                </div>

                <div class="mb-3 col-12">
                    <label for="name" class="form-label">Nombre</label>
                    <Field id="name" name="name" type="text" v-model="formData.name" class="form-control" />
                    <ErrorMessage name="name" class="error-message" />
                </div>

                <div class="mb-3 col-12">
                    <label for="surname" class="form-label">Apellido Paterno</label>
                    <Field id="surname" name="surname" type="text" v-model="formData.surname" class="form-control" />
                    <ErrorMessage name="surname" class="error-message" />
                </div>

                <div class="mb-3 col-12">
                    <label for="secondSurname" class="form-label">Apellido Materno</label>
                    <Field id="secondSurname" name="secondSurname" type="text" v-model="formData.secondSurname" class="form-control" />
                    <ErrorMessage name="secondSurname" class="error-message" />
                </div>

                <div class="mb-3 col-12">
                    <label for="expiracion" class="form-label">Fecha de Expiración</label>
                    <Field id="expiracion" name="expiracion" type="text" v-model="formData.expiracion" class="form-control" />
                    <ErrorMessage name="expiracion" class="error-message" />
                </div>

                <div class="mb-3 col-12">
                    <label for="email" class="form-label">Correo Electrónico</label>
                    <Field id="email" name="email" type="email" v-model="formData.email" class="form-control" />
                    <ErrorMessage name="email" class="error-message" />
                </div>

                <div class="mb-3 col-12">
                    <label for="password" class="form-label">Contraseña</label>
                    <Field id="password" name="password" type="password" v-model="formData.password" class="form-control" />
                    <ErrorMessage name="password" class="error-message" />
                </div>

                <div class="mb-3 col-12">
                    <label for="confirmPassword" class="form-label">Confirmar Contraseña</label>
                    <Field id="confirmPassword" name="confirmPassword" type="password" v-model="formData.confirmPassword" class="form-control" />
                    <ErrorMessage name="confirmPassword" class="error-message" />
                </div>

                <!-- Campo para seleccionar el rol -->
                <div class="col-12">
                    <label for="Roles" class="form-label white-text">Seleccionar Rango</label>
                    <select v-model="formData.selectedRol" class="form-control" id="Roles">
                        <option value="" disabled selected>Seleccione un rol</option>
                        <option v-for="rol in roles" :value="rol.id" :key="rol.id">{{ rol.rol }}</option>
                    </select>
                </div>

                <!-- Botón para enviar el formulario -->
                <div class="col-12">
                    <button type="submit" class="btn btn-primary main-btn" style="border:1px solid #ED6E00; background-color: #ED6E00 !important;">
                        Registrar
                    </button>
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
        schema: { 
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            formData: {
                rut: '',
                name: '',
                surname: '',
                secondSurname: '',
                expiracion: '',
                email: '',
                password: '',
                confirmPassword: '',
                selectedRol: null,
            },
            roles: rolesInfo,
            validationSchema: Yup.object().shape({
                rut: Yup.string().required('Campo Obligatorio').max(8, "El rut no puede superar los 8 digitos").min(7, "El rut debe tener minimo 7 digitos"),
                name: Yup.string().required('Campo Obligatorio'),
                surname: Yup.string().required('Campo Obligatorio'),
                secondSurname: Yup.string().required('Campo Obligatorio'),
                expiracion: Yup.string().required('Campo Obligatorio').matches(/^(0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/, 'Debe ser en formato dd/mm/yyyy'),
                email: Yup.string().email('Ingresar un Correo Valido').required('Campo Obligatorio'),
                password: Yup.string().required('Campo Obligatorio').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, 'La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra mayúscula, una letra minúscula y un número'),
                confirmPassword: Yup.string().required('Campo obligatorio').oneOf([Yup.ref('password')], 'Las contraseñas deben ser iguales')
            })
        };
    },
    methods: {
        async submitForm() {
            console.log('Registro enviado');
            if (this.formData.selectedRol === null) {
                alert('Se debe asignar un rol');
            } else {
                try {
                    const token = JSON.parse(localStorage.getItem('token'));
                    const apiurl = window.env.API_URL;
                    // Realizar una solicitud POST para registrar un nuevo usuario
                    await axios.post(`${apiurl}/register`, {
                        rut: this.formData.rut,
                        name: this.formData.name,
                        firstSurname: this.formData.surname,
                        secondSurname: this.formData.secondSurname,
                        email: this.formData.email,
                        password: this.formData.password,
                        rol: this.formData.selectedRol,
                        expiracionString: this.formData.expiracion,
                        token: token.token
                    });
                    alert('Los datos fueron enviados correctamente');
                    this.$router.push('/Users');
                } catch (error) {
                    if (error.response) {
                        alert('Hubo un error en enviar los datos: ' + error.response.data.message);
                    } else if (error.request) {
                        alert('Hubo error de red: No se recibió respuesta del servidor');
                    }
                }
            }
        }
    }
});
</script>

<style scoped>
.white-text {
    color: white;
}

.error-message {
    color: red;
    font-size: 0.875em;
}
</style>
