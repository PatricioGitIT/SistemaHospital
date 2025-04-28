<template>
    <Navbar /> <!-- Componente de barra de navegación -->
    <main>
        <!-- Componente de formulario de registro con el esquema definido -->
        <RegistroForm :schema="formSchema" />
    </main>
</template>

<script>
import { defineComponent } from 'vue';
import Navbar from '../components/navbar.vue'; // Componente de barra de navegación
import RegistroForm from '../components/Forms/RegistroForm.vue'; // Componente de formulario de registro
import * as Yup from 'yup'; // Importación de Yup para validación de esquemas
import { VerifyToken } from '../utils/utils.js'; // Función para verificar el token de autenticación

export default defineComponent({
    name: 'RegistroView', // Nombre del componente
    components: {
        Navbar, // Componente de barra de navegación
        RegistroForm // Componente de formulario de registro
    },
    mounted() {
        document.title = 'Registrar un nuevo usuario'; // Establece el título de la página
        const tokenData = JSON.parse(localStorage.getItem('token')); // Obtiene el token de localStorage
        if (VerifyToken(tokenData)) { // Verifica si el token es válido
            this.$router.push('/error'); // Redirige a la página de error si el token no es válido
        }
    },
    data() {
        const formSchema = { // Esquema para la validación del formulario de registro
            fields: [
                // Definición de campos del formulario con sus respectivas reglas de validación
            ],
        };
        return {
            formSchema // Retorna el esquema del formulario
        };
    }
})
</script>
