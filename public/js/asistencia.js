import axios from "axios";

document.addEventListener('DOMContentLoaded', () =>
{
    const asistencia = document.querySelector('#confirmar-asistencia');

    if(asistencia)
    {
        asistencia.addEventListener('submit', confirmarAsistencia);
    }
})

function confirmarAsistencia(e) 
{
    e.preventDefault();
    
    const btn = document.querySelector('#confirmar-asistencia input[type="submit"]');
    let accion = document.querySelector('#accion').value;
    const mensaje = document.querySelector('#mensaje');

    // Limpiar la respuesta previa
    while(mensaje.firstChild)
    {
        mensaje.removeChild(mensaje.firstChild);
    }

    // Obtine el valor de cancelar o confirmar del hidden
    const datos = { accion };


    axios.post(this.action, datos)
        .then(respuesta =>
        {
            if(accion === 'confirmar')
            {
                // Modificar los elementos del boton
                document.querySelector('#accion').value = 'cancelar';
                btn.value = 'Cancelar';
                btn.classList.remove('btn-azul');
                btn.classList.add('btn-rojo');
            }
            else
            {
                // Modificar los elementos del boton
                document.querySelector('#accion').value = 'confirmar';
                btn.value = 'Si';
                btn.classList.remove('btn-rojo');
                btn.classList.add('btn-azul');
            }

            // Mostrar un mensaje
            mensaje.appendChild(document.createTextNode(respuesta.data));
        })
}