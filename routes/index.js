const express = require('express');
const  homeController = require('../controllers/homeController.js');
const  usuariosController = require('../controllers/usuariosController.js');
const  authController = require('../controllers/authController.js');
const  adminController = require('../controllers/adminController.js');
const  gruposController = require('../controllers/gruposController.js');
const  meetiController = require('../controllers/meetiController.js');
const  meetiControllerFE = require('../controllers/frontend/meetiControllerFE.js');
const  usuariosControllerFE = require('../controllers/frontend/usuariosControllerFE.js');
const  gruposControllerFE = require('../controllers/frontend/gruposControllerFE.js');
const  comentariosControllerFE = require('../controllers/frontend/comentariosControllerFE.js');
const  busquedaControllerFE = require('../controllers/frontend/busquedaControllerFE.js');

const router = express.Router();

module.exports = function()
{
    // Area publica
    router.get('/', homeController.home);

    // Muesta un meeti
    router.get('/meeti/:slug', meetiControllerFE.mostrarMeeti);

    // Confirma la asistencia al meeti
    router.post('/confirmar-asistencia/:slug', meetiControllerFE.confirmarAsistencia);

    // Muestra asistentes al meeti
    router.get('/asistentes/:slug', meetiControllerFE.mostrarAsistentes);

    // Agrega comentarios en el Meeti
    router.post('/meeti/:id', comentariosControllerFE.agregarComentario);

    // Elimina comentarios en el meeti
    router.post('/eliminar-comentario', comentariosControllerFE.eliminarComentario);

    // Muestra perfiles en el FE
    router.get('/usuarios/:id', usuariosControllerFE.mostrarUsuario);

    // Muestra la grupos en el FE
    router.get('/grupos/:id', gruposControllerFE.mostrarGrupo);

    // Muestra meetis por categoria
    router.get('/categoria/:categoria', meetiController.mostrarCategoria);

    // Añade la busqueda
    router.get('/busqueda', busquedaControllerFE.resultadosBusqueda)

    // Crear y confirmar cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', usuariosController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta)

    // Iniciar sesion
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    // Cerrar sesion
    router.get('/cerrar-sesion', authController.usuarioAutenticado, authController.cerrarSesion);

    // Area privada
    // Panel de administracion
    router.get('/administracion', authController.usuarioAutenticado, adminController.panelAdministracion);
    
    // Nuevos grupos
    router.get('/nuevo-grupo', authController.usuarioAutenticado, gruposController.formNuevoGrupo);
    router.post('/nuevo-grupo', authController.usuarioAutenticado, gruposController.subirImagen, gruposController.crearGrupo);

    // Editar grupos
    router.get('/editar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.formEditarGrupo);
    router.post('/editar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.editarGrupo);

    // Editar la imagen del grupo
    router.get('/imagen-grupo/:grupoId', authController.usuarioAutenticado, gruposController.formEditarImagen);
    router.post('/imagen-grupo/:grupoId', authController.usuarioAutenticado, gruposController.subirImagen, gruposController.editarImagen);

    // Eliminar grupos
    router.get('/eliminar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.formEliminarGrupo);
    router.post('/eliminar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.eliminarGrupo);

    // Nuevos meeti
    router.get('/nuevo-meeti', authController.usuarioAutenticado, meetiController.formNuevoMeeti);
    router.post('/nuevo-meeti', authController.usuarioAutenticado, meetiController.sanitizarMeeti, meetiController.crearMeeti);

    // Editar meeti
    router.get('/editar-meeti/:id', authController.usuarioAutenticado, meetiController.formEditarMeeti);
    router.post('/editar-meeti/:id', authController.usuarioAutenticado, meetiController.editarMeeti);

    // Eliminar meeti
    router.get('/eliminar-meeti/:id', authController.usuarioAutenticado, meetiController.formEliminarMeeti);
    router.post('/eliminar-meeti/:id', authController.usuarioAutenticado, meetiController.eliminarMeeti);

    // Editar informacion de perfil
    router.get('/editar-perfil', authController.usuarioAutenticado, usuariosController.formEditarPerfil);
    router.post('/editar-perfil', authController.usuarioAutenticado, usuariosController.editarPerfil);

    // Modifica el password
    router.get('/cambiar-password', authController.usuarioAutenticado, usuariosController.formCambiarPassword);
    router.post('/cambiar-password', authController.usuarioAutenticado, usuariosController.cambiarPassword);

    // Imagen de perfil
    router.get('/imagen-perfil', authController.usuarioAutenticado, usuariosController.formSubirImagenPerfil);
    router.post('/imagen-perfil', authController.usuarioAutenticado, usuariosController.subirImagen, usuariosController.guardarImagenPerfil);

    return router;
};