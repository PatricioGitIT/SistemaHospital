<template>
    <div>
        <InicioForm :schema="formSchema"/>
    </div>
</template>

<script>
import { defineComponent } from 'vue'; // Importa la función defineComponent de Vue
import InicioForm from '../components/Forms/InicioForm.vue'; // Importa el componente InicioForm
import * as Yup from 'yup'; // Importa Yup para la validación del formulario

export default defineComponent({
    name: 'InicioView', // Nombre del componente
    components: {
        InicioForm,
    },
    mounted() {
        document.title = 'Inicio de sesión'; // Establece el título del documento HTML
    },
    data() {
        const formSchema = { // Define el esquema del formulario
            fields: [
                {
                    label: 'Rut sin digito verificador',
                    name: 'rut',
                    as: 'input',
                    class: 'form-control',
                    rules: Yup.string().required('Este Campo es Obligatorio'), // Reglas de validación para el campo rut
                },
                {
                    label: 'Contraseña',
                    name: 'password',
                    as: 'input',
                    type: 'password',
                    class: 'form-control',
                    rules: Yup.string().required('Este Campo es Obligatorio'), // Reglas de validación para el campo contraseña
                },
            ],
        };
        return {
            formSchema, // Retorna el esquema del formulario como parte de los datos del componente
        };
    },
});
</script>
