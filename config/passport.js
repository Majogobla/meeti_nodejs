const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios.js');

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
    },
    async (email, password, next) =>
    {
        // Codigo que se ejecuta al llenar el formulario
        const usuario = await Usuarios.findOne({where: {email, activo: 1}});

        // Revisa si existe o no 
        if(!usuario) return next(null, false, 
        {
            message: 'Eses usuario no existe',
        });

        // EL usuario existe, comparar su password
        const verificarPass = usuario.validarPassword(password);

        // Si el password es incorrecto
        if(!verificarPass) return next(null, false,
        {
            message: 'Contraseña incorrecta',
        });

        // Todo bien
        return next(null, usuario);
    }
));

passport.serializeUser(function(usuario, cb) 
{
    cb(null, usuario);
});

passport.deserializeUser(function(usuario, cb) 
{
    cb(null, usuario);
});

module.exports = passport;