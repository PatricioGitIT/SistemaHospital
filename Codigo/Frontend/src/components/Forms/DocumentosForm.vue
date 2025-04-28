<template>
  <div>
    <article>
      <h2>Subir Archivo</h2>
      <section class="container-md d-flex align-items-center w-75">
        <aside class="mr-3"><span class="material-icons icon">insert_drive_file</span></aside>
        <Form class="row g-3" :validation-schema="validationSchema" @submit="submitForm">
          <!-- Itera sobre los campos del esquema -->
          <div class="mb-3 col-12" v-for="{ as, name, label, ...attrs } in schema.fields" :key="name">
            <label :for="name" class="form-label">{{ label }}</label>
            <!-- Si el campo es de tipo 'file', utiliza un input de tipo 'file' -->
            <input v-if="as === 'file'" type="file" :id="name" :class="attrs.class" :name="name"
              @change="handleFileChange($event)">
            <!-- Si el campo no es de tipo 'file', utiliza el componente Field de vee-validate -->
            <Field v-else :as="as" :id="name" :class="attrs.class" :name="name" v-model="formData[name]" />
            <ErrorMessage :name="name" class="error-message" />
          </div>
          <div class=" mb-3 col-12">
            <label class="white-text" for="Ambitos">Seleccionar Ambito</label>
            <select v-model="formData.selectedAmbito" class="form-control" id="ambito">
              <option v-for="ambito in ambitos" :value="ambito.id" :key="ambito.id">{{ ambito.nombre }}</option>
            </select>
          </div>
          <div class=" mb-3 col-12">
            <label class="white-text" for="Ambitos">Quien puede ver</label>
            <select v-model="formData.selectedUser" class="form-control" id="usuario">
              <option v-for="usuario in usuarios" :value="usuario.id" :key="usuario.id">{{ usuario.nombre }}</option>
            </select>
          </div>
          <div class="mb-3 col-12">
            <button type="submit" class="btn btn-primary main-btn">Registrar</button>
          </div>
        </Form>
      </section>
    </article>
  </div>
</template>
  
<script>
import { defineComponent } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as Yup from 'yup';
import ambitosInfo from '../../json/ambitos.json';
import usuariosInfo from '../../json/usuarios.json'
import axios from 'axios';

export default defineComponent({
  name: 'DocumentosForm',
  components: {
    Field,
    Form,
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
        id: '',
        name: '',
        file: null,
        selectedAmbito: null,
        selectedUser:null

      },
      ambitos : ambitosInfo,
      usuarios: usuariosInfo,
      validationSchema: Yup.object().shape({
        // Define las reglas de validación para los campos del esquema
        name: Yup.string().required('Campo Obligatorio'),
        // El campo 'file' es opcional ya que su validación se realiza en el método handleFileChange
      }),
    };
  },
  methods: {
    async submitForm() {
      const url= window.env.API_URL
      if (this.formData.file === null) {
        alert('Agregar documento en formato PDF')
        return
      }
      else if(this.formData.selectedAmbito === null){
        alert('Debe seleccionar ambito')
        return
      }else if(this.formData.selectedUser === null){
        alert('Debe agregar quien puede verlo')
        return
      }
      const token = JSON.parse(localStorage.getItem('token'))
      try {
        const response = await axios.get(`${url}/checkDocumento/${this.formData.id}`)
        if(response.data === true){
          alert('Ya hay un documento con ese id')
          return
        }
      } catch (error) {
        alert('Hubo un error con el servidor, intentarlo nuevamente')
      }
      const formulario = new FormData()
      formulario.append('id',this.formData.id)
      formulario.append('name',this.formData.name)
      formulario.append('file',this.formData.file)
      formulario.append('ambito',this.formData.selectedAmbito)
      formulario.append('permisos',this.formData.selectedUser)
      formulario.append('token',token.token)
      try {
        const response = await axios.post(`${url}/documento`,formulario,{
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('El documento se subió con exito')
        this.$router.push('/SearchDocuments')
      } catch (error) {
        alert('Hubo un error al subir el documento intente de nuevo')
        console.error(error)
      }
    },
    handleFileChange(event) {
      // Actualiza el valor del campo 'file' cuando se selecciona un archivo
      const selectedFile = event.target.files[0];
      const maxSizeInBytes = 25 * 1024 * 1024 // 25 MB en bytes
      if (!selectedFile) {
        return
      }
      if(selectedFile.size > maxSizeInBytes){
        alert('El tamaño del documento excede el limite permitido (25 MB)')
        event.target.value = '';
        return
      }
      if (selectedFile.type !== 'application/pdf') {
        alert('el documento debe ser un PDF')
        event.target.value = '';
        return
      }
      this.formData.file = selectedFile;
    },
  },
});
</script>
  
<style scoped>
.white-text,
.custom-file-input {
  color: white;
}

.icon {
  margin: auto;
  font-size: 9.375rem;
}

.main-btn {
  border: 1px solid #ED6E00;
  background-color: #ED6E00 !important;
}

</style>
  