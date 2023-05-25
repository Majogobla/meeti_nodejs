const Categorias = require('../models/Categorias.js');
const Meeti = require('../models/Meeti.js');
const Grupos = require('../models/Grupos.js');
const Usuarios = require('../models/Usuarios.js');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.home = async (req, res) =>
{
    // Promise para consultas
    const consultas = [];
    consultas.push(Categorias.findAll({}));
    consultas.push(Meeti.findAll(
        {
            attributes: ['slug', 'titulo', 'fecha', 'hora'],
            where:
            {
                fecha: {[Op.gte]: moment(new Date()).format('YYYY-MM-DD')}
            },
            limit: 3,
            order: 
            [
                ['fecha', 'DESC']
            ],
            include:
            [
                {
                    model: Grupos,
                    attributes: ['imagen'],
                },
                {
                    model: Usuarios,
                    attributes: ['nombre', 'imagen'],
                },
            ]
        }
    ));

    // Extraer
    const [categorias, meetis] = await Promise.all(consultas);

    res.render('home',
    {
        nombrePagina: 'Inicio',
        categorias,
        meetis,
        moment,
    });
}