<template>
    <header>
        <img class="imagen" src="../assets/logo_top.png">
    </header>
    <main>
        <section class="jumbotron">
            <h1 class="display-4"><span class="material-icons icon">error</span>Ha ocurrido un error</h1>
            <p class="lead">Lamentablemente no tienes una sesión valida</p>
            <hr class="my-4">
            <p>Para volver al inicio haz click en el botón</p>
            <a href='/' class="btn btn-primary btn-lg">Volver</a>
        </section>
    </main>
    <footer>
    </footer>
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ErrorView',
    mounted() {
        document.title = 'Error'
        // Destruir el token 
        localStorage.removeItem('token');
    }
})
</script>

<style scoped>

header {
    background-color: #D9D9D9;
}

footer {
    height: 126px;
    background-color: #D9D9D9;
    margin-top: auto;
}

.imagen {
    width: 195px;
    height: 126px;
}

.btn-lg {
    border: 1px solid #ED6E00;
    background-color: #ED6E00 !important;
}

.btn-lg:active,.btn-lg:hover {
    border: 1px solid #FD9D4A;
}

.icon {
    font-size: 4rem;
}

.jumbotron {
    margin-left: 2rem;
}
</style>