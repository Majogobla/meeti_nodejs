const passport = require('passport');

exports.autenticarUsuario = passport.authenticate('local',
{
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios',
});

// Revisa si el usuario está autenticado o no
exports.usuarioAutenticado = (req, res, next) =>
{
    // Si el usuario está autenticado
    if(req.isAuthenticated()) return next();

    // Si no esta autenticado
    return res.redirect('/iniciar-sesion');
}

// Cerrar sesion
exports.cerrarSesion = (req, res, next) =>
{
    req.logout(function(error)
    {
        if(error) console.log(error);
    });
    req.flash('correcto', 'Cerraste sesión correctamente');
    res.redirect('/iniciar-sesion');
    return next();
}