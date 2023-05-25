const Meeti = require('../../models/Meeti.js');
const Grupos = require('../../models/Grupos.js');
const Usuarios = require('../../models/Usuarios.js');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

exports.resultadosBusqueda = async (req, res) =>
{
    // Leer datos de la url
    const { categoria, titulo, ciudad, pais } = req.query;

    // Si la categoria esta vacia;
    let query;
    if(categoria === '')
    {
        query = ''
    }
    else
    {
        query = `where: { categoriaId: {[Op.eq]: ${categoria}}}`;
    }

    // Filtrar los terminos de la buqueda
    const meetis = await Meeti.findAll(
        {
            where: 
            {
                titulo: {[Op.iLike]: '%' + titulo + '%'},
                ciudad: {[Op.iLike]: '%' + ciudad + '%'},
                pais: {[Op.iLike]: '%' + pais + '%'},
            },
            include:
            [
                {
                    model: Grupos,
                    query
                },
                {
                    model: Usuarios,
                    attributes: ['id', 'nombre', 'imagen'],
                }
            ],
        }
    );

    // Pasar los resultados a la vista
    res.render('busqueda',
    {
        nombrePagina: 'Resultados Búsqueda',
        meetis,
        moment,
    })
}