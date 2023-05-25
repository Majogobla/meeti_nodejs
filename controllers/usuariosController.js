const Usuarios = require('../models/Usuarios.js');
const enviarEmail = require('../handlers/emails.js');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter =
{
    limits: {fileSize: 1000000},
    storage: fileStorage = multer.diskStorage(
        {
            destination: (req, res, next) =>
            {
                next(null, __dirname+'/../public/uploads/perfiles/');
            },
            filename: (req, file, next) =>
            {
                const extension = file.mimetype.split('/')[1];
                next(null, `${shortid.generate()}.${extension}`);
            }
        }
    ),
    fileFilter(req, file, next)
    {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg')
        {
            // El formato es válido
            next(null, true);
        }
        else
        {
            // El formato no es válido
            next(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

// Sube una imagen al servidor
exports.subirImagen = (req, res, next) =>
{
    upload(req, res, function(error)
    {
        if(error)
        {
            // console.log(error);
            
            if(error instanceof multer.MulterError)
            {
                if(error.code === 'LIMIT_FILE_SIZE')
                {
                    req.flash('error', 'El Archivo es demasiado grande');

                }
                else
                {
                    req.flash('error', error.message);
                }
            }
            else if(error.hasOwnProperty('message'))
            {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        }
        else
        {
            next();
        }
    })
}

exports.formCrearCuenta = (req, res) =>
{
    res.render('crear-cuenta',
    {
        nombrePagina: 'Crea tu Cuenta'
    });
}

exports.crearNuevaCuenta = async (req, res) =>
{
    const usuario = req.body;
    
    req.checkBody('confirmar', 'Repetir la Contraseña es Obligatorio').notEmpty();
    req.checkBody('confirmar', 'Las Contraseñas son Diferentes').equals(req.body.password);

    // Leer los errores de express
    const erroresExpress = req.validationErrors();

    try 
    {
        await Usuarios.create(usuario);

        // Url de confirmacion
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        // Enviar email de confirmacion
        await enviarEmail.enviarEmail(
            {
                usuario,
                url,
                subject: 'Confirma tu Cuenta de Meeti',
                archivo: 'confirmar-cuenta'
            }
        );

        // Flash message y redireccionar
        req.flash('exito', 'Hemos enviado un correo, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    } 
    catch (error) 
    {
        // Extraer unicamente el message de los errores
        const erroresSequelize = error.errors.map(error => error.message);
        
        // Extraer unicamente el msg de los errores
        const errExp = erroresExpress.map(error => error.msg);

        // Unir los errores
        const listaErrores = [...erroresSequelize, ...errExp];

        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
}

exports.formIniciarSesion = (req, res) =>
{
    res.render('iniciar-sesion',
    {
        nombrePagina: 'Iniciar Sesión'
    });
}

// Confirma la subscripcion
exports. confirmarCuenta = async (req, res, next) =>
{
    // Verificar que el usuario existe
    const usuario = await Usuarios.findOne({where: {email: req.params.correo}});

    // SI no existe, redireccionar
    if(!usuario) 
    {
        req.flash('error', 'Esa cuenta no existe');
        res.redirect('/crear-cuenta');
        return next();
    }

    // Si existe confirmar subscripcion y redireccionar
    usuario.activo = 1;
    await usuario.save();
    req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesión');
    res.redirect('/iniciar-sesion');
};

// Muestra formulaior para editar perfil
exports.formEditarPerfil = async (req, res) =>
{
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil',
    {
        nombrePagina: 'Editar Perfil',
        usuario,
    })
}

// Almacena los cambios en la BD
exports.editarPerfil = async (req, res) =>
{
    const usuario = await Usuarios.findByPk(req.user.id);

    req.sanitizeBody('titulo');
    req.sanitizeBody('email');

    // Leer datos del form
    const {nombre, descripcion, email} = req.body;

    // Asignar los valores
    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    console.log(descripcion);
    console.log(usuario);

    // Guardar en la BD
    await usuario.save();
    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');
}

// Muestra el formulario para cambiar el password
exports.formCambiarPassword = (req, res) =>
{
    res.render('cambiar-password',
    {
        nombrePagina: 'Cambiar Contraseña',
    })
}

// Guarda la contraseña nueva en la BD
exports.cambiarPassword = async (req, res, next) =>
{
    const usuario = await Usuarios.findByPk(req.user.id);

    // Verificar que el password anterior sea correcto
    if(!usuario.validarPassword(req.body.anterior))
    {
        req.flash('error', 'La Contraseña actual es incorrecta');
        res.redirect('/administracion');
        return next();
    }

    // Si el password es correcto, hashear el nuevo
    const hash = usuario.hashPassword(req.body.nuevo);

    // Asignar el password al usuario
    usuario.password = hash;

    // Guardar en la BD
    await usuario.save();

    // Redireccionar
    req.logout(function(error)
    {
        console.log(error);
    });
    req.flash('exito', 'Contraseña actualizada correctamente, vuelve a iniciar sesiónn');
    res.redirect('/iniciar-sesion');
}

// Muestra el formulario de subir imagen
exports.formSubirImagenPerfil = async (req, res) =>
{
    const usuario = await Usuarios.findByPk(req.user.id);

    // muestra la vista
    res.render('imagen-perfil',
    {
        nombrePagina: 'Subir Imagen perfil',
        usuario
    })
}

// Guarda la imagen nueva, elimina la anterior y guarda el registro en la BD
exports.guardarImagenPerfil = async (req, res) =>
{
    const usuario = await Usuarios.findByPk(req.user.id);

    // Si hay imagen anterior eliminarla
    if(req.file && usuario.imagen)
    {
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;

        // Eliminar archivo con FS
        fs.unlink(imagenAnteriorPath, (error) =>
        {
            if(error)
            {
                console.log(error);
            }

            return;
        });
    }

    // Almacenar la nueva imagen
    if(req.file)
    {
        usuario.imagen = req.file.filename;
    }

    // Guardar en la BD
    await usuario.save();
    req.flash('exito', 'Cambios almacenados correctamente');
    res.redirect('/administracion');
}