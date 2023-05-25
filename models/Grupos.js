const Sequelize = require('sequelize');
const db = require('../config/db.js');
const Categorias = require('./Categorias.js');
const Usuarios = require('./Usuarios.js');

const Grupos = db.define('grupos',
{
    id:
    {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
    },
    nombre: 
    {
        type: Sequelize.TEXT(100),
        allowNull: false,
        validate:
        {
            notEmpty: {msg: 'El Nombre es Obligatorio'}
        }
    },
    descripcion:
    {
        type: Sequelize.TEXT,
        allowNull: false,
        validate:
        {
            notEmpty: {msg: 'La Descripción es Obligatoria'}
        }
    },
    url: Sequelize.TEXT,
    imagen: Sequelize.TEXT,
});

Grupos.belongsTo(Categorias);
Grupos.belongsTo(Usuarios);

module.exports = Grupos;