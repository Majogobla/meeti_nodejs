const Grupos = require('../models/Grupos.js');
const Meeti = require('../models/Meeti.js');
const Categorias = require('../models/Categorias.js');
const uuid = require('uuid');
const Usuarios = require('../models/Usuarios.js');
const moment = require('moment');

// Muestra el formulario para nuevos meeti
exports.formNuevoMeeti = async (req, res) =>
{
    const grupos = await Grupos.findAll({where: {usuarioId: req.user.id}});

    res.render('nuevo-meeti',
    {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos,
    })
}

// Inserta nuevos meeti en la BD
exports.crearMeeti = async (req, res) =>
{
    // Obtener los matos
    const meeti = req.body;
    
    // Asignar el usuario
    meeti.usuarioId = req.user.id;

    // Almacena la ubicacion con un point
    const point = 
    {
        type: 'Point',
        coordinates: 
        [
            parseFloat(req.body.lat), 
            parseFloat(req.body.lng),
        ]
    };
    meeti.ubicacion = point;

    // Cupo opcional
    if(req.body.cupo === '')
    {
        meeti.cupo = 0;
    }

    meeti.id = uuid.v4();

    // Almacenar en la BD
    try 
    {
        await Meeti.create(meeti);
        req.flash('exito', 'Se ha creado el Meeti Correctamente');
        res.redirect('/administracion');
    } 
    catch (error) 
    {
        // Extraer unicamente el message de los errores
        const erroresSequelize = error.errors.map(error => error.message);

        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }
}

// Sanitiza los meeti
exports.sanitizarMeeti = (req, res, next) =>
{
    req.sanitizeBody('titulo');
    req.sanitizeBody('invitado');
    req.sanitizeBody('cupo');
    req.sanitizeBody('fecha');
    req.sanitizeBody('hora');
    req.sanitizeBody('direccion');
    req.sanitizeBody('ciudad');
    req.sanitizeBody('estado');
    req.sanitizeBody('pais');
    req.sanitizeBody('lat');
    req.sanitizeBody('lng');
    req.sanitizeBody('grupoId');

    next();
}

// Muestra el formualrio para editar meeti
exports.formEditarMeeti = async (req, res, next) =>
{
    const consultas = [];
    consultas.push(Grupos.findAll({where: {usuarioId: req.user.id}}));
    consultas.push(Meeti.findByPk(req.params.id));

    // Retorna un promise
    const [grupos, meeti] = await Promise.all(consultas);

    if(!grupos || !meeti)
    {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // Mostrar la vista
    res.render('editar-meeti',
    {
        nombrePagina: `Editar Meeti: ${meeti.titulo}`,
        grupos,
        meeti,
    })
}

// Almacena los cambios en el meeti
exports.editarMeeti = async (req, res, next) =>
{
    const meeti = await Meeti.findOne({where: {id: req.params.id, usuarioId: req.user.id}});

    if(!meeti)
    {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // Asignar los valores
    const {grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng} = req.body;

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;
    meeti.pais = pais;

    // Asignar el point
    const point = {type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)]};
    meeti.ubicacion = point;

    // Almacenarlo en la BD
    await meeti.save();
    req.flash('exito', 'Cambios guradados correctamente');
    res.redirect('/administracion');
}

// Muestra el formulario para eliminar meeti
exports.formEliminarMeeti = async (req, res, next) =>
{
    const meeti = await Meeti.findOne({where: {id: req.params.id, usuarioId: req.user.id}});

    if(!meeti)
    {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // Mostrar la vista
    res.render('eliminar-meeti',
    {
        nombrePagina: `Eliminar Meeti: ${meeti.titulo}`,
    })
}

// Elimina el meeti de la BD
exports.eliminarMeeti = async (req, res) =>
{
    await Meeti.destroy({where: {id: req.params.id}});

    req.flash('exito', 'Meeti eliminado correctamente');
    res.redirect('/administracion');
}

// Muestra los meetis agrupados por categoria
exports.mostrarCategoria = async (req, res, next) =>
{
    const categoria = await Categorias.findOne(
        {
            attributes: ['id', 'nombre'],
            where: 
            {slug: req.params.categoria}
        }
    );

    const meetis = await Meeti.findAll(
        {
            order: 
            [
                ['fecha', 'ASC']
            ],
            include:
            [
                {
                    model: Grupos,
                    where: {categoriaId: categoria.id}
                },
                {
                    model: Usuarios
                }
            ]
        }
    );

    res.render('categoria',
    {
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment,
    })
}