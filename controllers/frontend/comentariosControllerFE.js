const Comentarios = require('../../models/Comentarios.js');
const Meeti = require('../../models/Meeti.js');

exports.agregarComentario = async (req, res, next) =>
{
    // Obtener comentario
    const { comentario } = req.body;

    // Crear comentario en la BD
    await Comentarios.create(
        {
            mensaje: comentario,
            usuarioId: req.user.id,
            meetiId: req.params.id,
        }
    );

    // Redireccionar a la misma pagina
    res.redirect('back');
    return next();
}

exports.eliminarComentario = async (req, res, next) =>
{
    const { comentarioId } = req.body;

    // Consultar el comentario
    const comentario = await Comentarios.findOne({where: {id: comentarioId}});

    // Verificar que exista
    if(!comentario)
    {
        res.status(404).send('Acción no válida');
        return next();
    }

    // Consultar el meeti
    const meeti = await Meeti.findOne({where: {id: comentario.meetiId}});

    // Verificar el dueño
    if(comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id)
    {
        await Comentarios.destroy({where: {id: comentario.id}});
        res.status(200).send('Eliminado Correctamente');
        return next();
    }
    else
    {
        res.status(403).send('Acción no válida');
        return next();
    }
}