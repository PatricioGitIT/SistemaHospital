import { createRouter, createWebHistory } from "vue-router";
import HomeView from '../view/HomeView.vue';
import documentosView from '../view/DocumentosView.vue';
import VideosView from '../view/VideosView.vue'
import MenuView from '../view/MenuView.vue';
import registrarView from '../view/RegistroView.vue';
import DocumentsAmbitsView from '../view/DocumentsAmbitsView.vue';
import ReproductorView from '../view/ReproductorView.vue';
import ErrorView from '../view/ErrorView.vue';
import SearchDocuments from '../view/SearchDocuments.vue';
import SearchVideo from '../view/SearchVideo.vue';
import SubirDocumentosView from '../view/SubirDocumentosView.vue'
import SubirVideoView from '../view/SubirVideoView.vue';
import userView from '../view/userView.vue';
import UserFounded from '../view/userFounded.vue';
import ModificarUser from '../view/ModificarUser.vue';

const routes = [
    {
        path: '/Error',
        name: 'Error',
        component: ErrorView
    },
    {
        path: '/Users',
        name: 'Usuarios',
        component: userView
    },
    {
        path: '/',
        name: 'Home',
        component: HomeView
    },
    {
        path: '/documentos',
        name: 'Documentos',
        component: documentosView
    },
    {
        path: '/menu',
        name: 'menu',
        component: MenuView
    },
    {
        path: '/registrar',
        name: 'registrar',
        component: registrarView
    },
    {
        path: '/videos',
        name: 'Videos',
        component: VideosView
    },
    {
        path: '/SearchDocuments',
        name: 'Buscar Documentos',
        component: SearchDocuments
    },
    {
        path: '/SearchVideo',
        name: 'Buscar Videos',
        component: SearchVideo
    },
    {
        path: '/documentos/:id',
        name: 'Documentos ambito',
        component: DocumentsAmbitsView
    },
    {
        path: '/reproductor/:nombre/:descripcion/:url',
        name: 'Reproductor',
        component: ReproductorView
    },
    {
        path: '/subirVideo',
        name: 'SubirVideo',
        component: SubirVideoView
    },
    {
        path: '/subirDocumento',
        name: 'Subir Documento',
        component: SubirDocumentosView
    },
    {
        path: '/UserFounded',
        name: 'Buscar Usuarios',
        component : UserFounded
    },
    {
        path: '/ModificarUser',
        name: 'Modificar Usuario',
        component: ModificarUser
    },
]
const router = createRouter({
    history: createWebHistory('/'),
    routes
});
export default router;