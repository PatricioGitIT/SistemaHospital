<template>
    <header>
        <img class="imagen" src="../assets/logo_top.png">
    </header>
    <main>
        <InicioView/>
    </main>
    <footer>
    
    </footer>
</template>
<script>
import { defineComponent } from 'vue';
import InicioView from './InicioView.vue';

export default defineComponent({
    name: 'HomeView',
    components: {
        InicioView,
    },
})
</script>
<style scoped>
header{
    background-color: #D9D9D9;
}
footer{
    height: 126px;
    background-color: #D9D9D9;
    margin-top: auto;
}
.imagen {
    width: 195px;
    height: 126px;
}
</style>
