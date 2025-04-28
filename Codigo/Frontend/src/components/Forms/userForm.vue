<template>
    <!-- Contenedor principal del formulario -->
    <article class="form-content">
        <!-- Sección de registro -->
        <section class="signup container-md w-75">
            <!-- Título del formulario -->
            <h2 class="white-text">Modificar usuario</h2>
            <!-- Instrucciones -->
            <h6 class="white-text">Solo rellenar los campos que va a actualizar</h6>
            <!-- Formulario -->
            <Form class="row g-3" :validation-schema="validationSchema" @submit="submitForm">
                <!-- Iteración sobre los campos del formulario -->
                <div class="mb-3 col-12" v-for="{ as, name, label, ...attrs } in schema.fields" :key="name">
                    <!-- Etiqueta del campo -->
                    <label :for="name" class="form-label">{{ label }}</label>
                    <!-- Campo de entrada -->
                    <Field :as="as" :id="name" :class="attrs.class" :name="name" v-bind="attrs" v-model="formData[name]" />
                    <!-- Mensaje de error -->
                    <ErrorMessage :name="name" class="error-message" />
                </div>
                <!-- Selector de rol -->
                <div class="col-12">
                    <label class="white-text" for="Roles">Seleccionar Rol</label>
                    <select v-model="formData.rol" class="form-control" id="Rol">
                        <option v-for="rol in roles" :value="rol.id" :key="rol.id">{{ rol.rol }}</option>
                    </select>
                </div>
                <!-- Botón de envío -->
                <div class="col-12">
                    <button type="submit" class="btn btn-primary main-btn"
                        style="border:1px solid #ED6E00; background-color: #ED6E00 !important;">Registrar cambios</button>
                </div>
            </Form>
        </section>
    </article>
</template>
  
<script>
import { defineComponent } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate'; // Importa componentes de vee-validate para validación de formularios
import * as Yup from 'yup'; // Importa Yup para definir esquemas de validación
import axios from 'axios'; // Importa axios para hacer solicitudes HTTP
import rolesInfo from '../../json/roles.json'; // Importa la información de roles desde un archivo JSON

export default defineComponent({
    name: 'UserForm', // Nombre del componente
    components: { // Componentes utilizados en el formulario
        Form,
        Field,
        ErrorMessage,
    },
    props: { // Propiedades esperadas por el componente
        schema: { // Esquema de validación del formulario
            type: Object,
            required: true,
        },
        UserID: { // ID del usuario a modificar
            type: String,
            required: true,
        }
    },
    data() { // Datos del componente
        return {
            formData: { // Datos del formulario
                nombre: '',
                apellidopaterno: '',
                apellidopaterno: '',
                expiracion: '',
                email: '',
                password: '',
                confirmPassword: '',
                rol: null
            },
            roles: rolesInfo, // Información de roles
            validationSchema: Yup.object().shape({ // Esquema de validación Yup
                nombre: Yup.string().max(15, 'El campo no debe de superar los 15 caracteres'),
                apellidopaterno: Yup.string().max(15, 'El campo no debe de superar los 15 caracteres'),
                apellidomaterno: Yup.string().max(15, 'El campo no debe de superar los 15 caracteres'),
                expiracion: Yup.string().nullable().test('date-format', 'Debe ser en formato dd/mm/yyyy', function (value) {
                    if (!value) return true; // Permitir valores nulos o vacíos
                    return /^(0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/.test(value);
                }),
                email: Yup.string().email('Ingresar un Correo Valido').max(40, 'El campo no debe de superar los 40 caracteres'),
                password: Yup.string()
                    .test(
                        'password-format',
                        'La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra mayúscula, una letra minúscula y un número',
                        (value) => {
                            if (!value) return true; // Permitir valores nulos
                            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
                        }
                    ),
                confirmPassword: Yup.string()
                    .oneOf([Yup.ref('password')], 'Las contraseñas deben ser iguales')
            })
        };
    },
    methods: { // Métodos del componente
        async submitForm() { // Método para enviar el formulario
            const token = JSON.parse(localStorage.getItem('token')) // Obtener el token de localStorage
            const formDataJSON = {} // Objeto para almacenar los datos del formulario a enviar
            for (const key in this.formData) { // Iterar sobre los datos del formulario
                if (this.formData[key]) { // Verificar si el valor no es nulo o vacío
                    if (this.formData[key] !== null) { // Verificar si el valor no es nulo
                        if (key === 'password') { // Si es la contraseña
                            formDataJSON['contrasenya'] = this.formData[key] // Almacenarla como 'contrasenya' en el objeto
                        } else if (key === 'confirmPassword') { // Si es la confirmación de contraseña
                            continue // Saltar esta propiedad
                        } else { // Para otras propiedades
                            formDataJSON[key] = this.formData[key]; // Almacenar el valor en el objeto
                        }
                    }
                }
            }
            try { // Intentar enviar los datos del formulario al servidor
                const apiurl= window.env.API_URL // Obtener la URL de la API desde el entorno
                const response = await axios.patch(`${apiurl}/usuarios/${this.UserID}`, formDataJSON, { // Enviar la solicitud PATCH al servidor
                    headers:{
                        authorization: token.token // Incluir el token de autorización en los encabezados
                    }
                })
                alert('Se realizaron los cambios correctamente') // Mostrar mensaje de éxito
            } catch (error) { // Si hay un error
                alert(error.response.data) // Mostrar el mensaje de error proporcionado por el servidor
                console.log(error) // Registrar el error en la consola
            } finally { // Después de intentar enviar los datos
                this.$router.push('/Users') // Redirigir a la página de usuarios
            }
        }
    }
});
</script>

  
<style scoped>
.white-text {
    color: white;
}
</style>
  