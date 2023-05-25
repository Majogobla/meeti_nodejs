const Categorias = require('../models/Categorias.js');
const Grupos = require('../models/Grupos.js');
const uuid = require('uuid');

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
                next(null, __dirname+'/../public/uploads/grupos/');
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

exports.formNuevoGrupo = async (req, res) =>
{
    const categorias = await Categorias.findAll();

    res.render('nuevo-grupo',
    {
        nombrePagina: 'Crea un nuevo grupo',
        categorias,
    })
}

// Almacena los grupos en la BD
exports.crearGrupo = async (req, res) =>
{
    // Sanitizar los campos
    req.sanitizeBody('nombre');
    req.sanitizeBody('url');
    
    const grupo = req.body;

    // Almacena el usuario autenticado como el creador del grupo
    grupo.usuarioId = req.user.id;

    grupo.categoriaId = req.body.categoria;

    // Leer la imagen
    if(req.file)
    {
        grupo.imagen = req.file.filename;
    }

    grupo.id = uuid.v4();

    try 
    {
        // Almacenar en la BD
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el Grupo Correctamente');
        res.redirect('/administracion');
    } 
    catch (error) 
    {
        // console.log(error);

        // Extraer unicamente el message de los errores
        const erroresSequelize = error.errors.map(error => error.message);

        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
}

exports.formEditarGrupo = async (req, res) =>
{
    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.grupoId));
    consultas.push(Categorias.findAll());

    // Promise con await
    const [grupo, categorias] = await Promise.all(consultas);

    res.render('editar-grupo',
    {
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias,
    })
}

// Guarda los cambios en la BD
exports.editarGrupo = async (req, res, next) =>
{
    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}});

    // Si no existe ese grupo o no es el dueño
    if(!grupo)
    {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // Todo bien, leer los datos
    const { nombre, descripcion, categoria, url } = req.body;

    // Asignar los valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoria;
    grupo.url = url;

    // Guardar en la BD
    await grupo.save();
    req.flash('exito', 'Cambios almacenados correctamente');
    res.redirect('/administracion');
}

// Muestra un formulario para editar la imagen del grupo
exports.formEditarImagen = async (req, res) =>
{
    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}});

    res.render('imagen-grupo',
    {
        nombrePagina: `Editar Imagen Grupo: ${grupo.nombre}`,
        grupo
    })
}

// Modifica la imagen en la BD y elimina la anterio
exports.editarImagen = async (req, res, next) =>
{
    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}});

    // Si el grupo no existe o no es válido
    if(!grupo)
    {
        req.flash('error', 'Operacion no válida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    // // Verificar que el archivo sea nuevo
    // if(req.file)
    // {
    //     console.log(req.file.filename);
    // }

    // // Revisar que exista un archivo anterior
    // if(grupo.imagen)
    // {
    //     console.log(grupo.imagen);
    // }

    // Si hay imagen anterior y nueva, borramos la anterior
    if(req.file && grupo.imagen)
    {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

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

    // Si hay una imagen nueva, guardar
    if(req.file)
    {
        grupo.imagen = req.file.filename;
    }

    // Guardar en la BD
    await grupo.save();
    req.flash('exito', 'Cambios almacenados correctamente');
    res.redirect('/administracion');
}

// Muestra el formulario para eliminar un grupo
exports.formEliminarGrupo = async (req, res, next) =>
{
    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}});

    if(!grupo)
    {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // todo bien, ejecutar la vista
    res.render('eliminar-grupo',
    {
        nombrePagina: `Eliminar Grupo: ${grupo.nombre}`
    })
}

// ELimina el grupo e imagen
exports.eliminarGrupo = async (req, res, next) =>
{
    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}});

    // Si hay una imagen, eliminarla
    if(grupo.imagen)
    {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

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

    // Eliminar el grupo
    await Grupos.destroy(
        {
            where:
            {
                id: req.params.grupoId,
            }
        }
    )

    // Redireccionar al usuario
    req.flash('exito', 'Grupo Eliminado');
    res.redirect('/administracion');
}