const Sequelize = require('sequelize');
const db = require('../config/db.js');
const Usuarios = require('../models/Usuarios.js');
const Meeti = require('../models/Meeti.js');

const Comentarios = db.define('comentario',
{
    id:
    {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    mensaje: Sequelize.TEXT,
},
{
    timestamps: false,
});

Comentarios.belongsTo(Usuarios);
Comentarios.belongsTo(Meeti);

module.exports = Comentarios;