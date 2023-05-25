require('dotenv').config({path: 'variables.env'});

module.exports = 
{
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
}