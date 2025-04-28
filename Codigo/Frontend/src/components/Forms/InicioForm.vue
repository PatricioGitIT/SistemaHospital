<template>
    <!-- Contenedor principal del formulario -->
    <main class="form-content">
        <!-- Contenido principal del formulario -->
        <article class="main-content container-md w-75">
            <!-- Título del formulario -->
            <h2 class="w-25 text">Bienvenido</h2>
            <!-- Formulario de inicio de sesión -->
            <Form class="row g-3" @submit="SubmitForm">
                <!-- Iterar sobre los campos del formulario -->
                <section class="mb-3 col-12" v-for="{ as, name, label, children, ...attrs } in schema.fields" :key="name">
                    <!-- Etiqueta del campo -->
                    <label :for="name" class="form-label">{{ label }}</label>
                    <!-- Campo de entrada -->
                    <Field :as="as" :id="name" :class="attrs.class" :name="name" v-bind="attrs" v-model="formData[name]">
                        <!-- Verificar si el campo tiene elementos hijos -->
                        <template v-if="children && children.length">
                            <!-- Iterar sobre los elementos hijos -->
                            <component v-for="({ tag, text, ...childAttrs }, idx) in children" :key="idx" :is="tag" v-bind="childAttrs">
                                {{ text }} <!-- Mostrar el texto del elemento hijo -->
                            </component>
                        </template>
                    </Field>
                    <!-- Mensaje de error asociado al campo -->
                    <ErrorMessage :name="name" class="error-message" />
                </section>
                <!-- Botón de enviar el formulario -->
                <section class="mb-3 col-12">
                    <button type="submit" class="btn btn-primary main-btn" style="border:1px solid  #ED6E00 ; background-color: #ED6E00 !important;">Iniciar Sesión</button>
                </section>
            </Form>
        </article>
    </main>
</template>

<script>
import { Form, Field, ErrorMessage } from 'vee-validate'; // Importar componentes de vee-validate
import axios from 'axios'; // Importar axios para realizar solicitudes HTTP

export default {
    name: 'InicioForm',
    components: {
        Form,
        Field,
        ErrorMessage,
    },
    props: {
        schema: { // Propiedad para el esquema del formulario
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            formData: { // Datos del formulario
                rut: '', // Rut del usuario
                password: '' // Contraseña del usuario
            },
        };
    },
    methods: {
        async SubmitForm() {
            try {
                const url= window.env.API_URL; // URL de la API obtenida desde las variables de entorno
                const res = await axios.post(`${url}/login`, { // Realizar una solicitud POST para iniciar sesión
                    rut: this.formData.rut, // Enviar el rut del usuario
                    password: this.formData.password, // Enviar la contraseña del usuario
                });
                if (res) {
                    // Obtener token del resultado de la solicitud
                    const token = res.data;
                    // Obtener la fecha y hora actual
                    const currentTime = new Date();
                    // Calcular la fecha y hora de expiración sumando 2 horas al tiempo actual
                    const expirationTime = new Date(currentTime.getTime() + (2 * 60 * 60 * 1000)); // 2 horas en milisegundos
                    // Formatear la fecha y hora de expiración en el formato deseado (dd/mm/yyyy HH:mm:ss)
                    const formattedExpiration = expirationTime.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });

                    // Almacenar el token y su fecha de expiración en el almacenamiento local
                    localStorage.setItem('token', JSON.stringify({
                        token: token,
                        expires: formattedExpiration
                    }));
                    // Redireccionar a la página del menú después de iniciar sesión exitosamente
                    this.$router.push('/menu');
                }
            } catch (error) {
                // Manejar errores durante la solicitud de inicio de sesión
                alert('Credenciales incorrectas');
            }
        }
    }
}
</script>

<style>
/* Estilos CSS específicos para este componente */
.error-message {
    color: #FFD700; /* Color del mensaje de error */
}

.container-md {
    background-color: #005883 !important; /* Color de fondo del contenedor */
}

.text {
    color: white; /* Color del texto */
}

.form-label {
    color: white; /* Color de las etiquetas de los campos */
}
</style>
