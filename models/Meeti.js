const Sequelize = require('sequelize');
const db = require('../config/db.js');
const uuid = require('uuid');
const slug = require('slug');
const shortid = require('shortid');

const Usuarios = require('../models/Usuarios.js');
const Grupos = require('../models/Grupos.js');

const Meeti = db.define('meeti',
{
    id: 
    {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
    },
    titulo:
    {
        type: Sequelize.STRING,
        allowNull: false,
        validate:
        {
            notEmpty: {msg: 'El título es obligatorio'},
        },
    },
    slug:
    {
        type: Sequelize.STRING,
    },
    invitado: Sequelize.STRING,
    cupo:
    {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    descripcion:
    {
        type: Sequelize.TEXT,
        allowNull: false,
        validate:
        {
            notEmpty: {msg: 'La descripción es obligatoria'},
        },
    },
    fecha:
    {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate:
        {
            notEmpty: {msg: 'La fecha es obligatoria'},
        },
    },
    hora:
    {
        type: Sequelize.TIME,
        allowNull: false,
        validate:
        {
            notEmpty: {msg: 'La hora es obligatoria'},
        },
    },
    direccion:
    {
        type: Sequelize.STRING,
        allowNull: false,
        validate:
        {
            notEmpty: {msg: 'La dirección es obligatoria'},
        },
    },
    ciudad:
    {
        type: Sequelize.STRING,
        allowNull: false,
        validate:
        {
            notEmpty: {msg: 'La ciudad es obligatoria'},
        },
    },
    estado:
    {
        type: Sequelize.STRING,
        allowNull: false,
        validate:
        {
            notEmpty: {msg: 'El estado es obligatorio'},
        },
    },
    pais:
    {
        type: Sequelize.STRING,
        allowNull: false,
        validate:
        {
            notEmpty: {msg: 'El pais es obligatorio'},
        },
    },
    ubicacion:
    {
        type: Sequelize.GEOMETRY('POINT'),
    },
    interesados:
    {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
    }
},
{
    hooks:
    {
        async beforeCreate(meeti) 
        {
            const url = slug(meeti.titulo).toLowerCase();
            meeti.slug = `${url}-${shortid.generate()}`;
        },
    }
});

Meeti.belongsTo(Usuarios);
Meeti.belongsTo(Grupos);

module.exports = Meeti;