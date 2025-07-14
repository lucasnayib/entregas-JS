// Datos de productos (simples)
const productosTienda = [
    { id: 1, nombre: "Camiseta", precio: 20, imagen: "imagenes/remera.jpg" },
    { id: 2, nombre: "Pantalón", precio: 40, imagen: "imagenes/pantalon.jpeg" },
    { id: 3, nombre: "Zapatos", precio: 60, imagen: "imagenes/zapatos.jpg" },
];

// Variable global para el carrito
let miCarrito = [];

// Referencias a elementos del HTML
const divProductos = document.getElementById('productos-disponibles');
const divListaCarrito = document.getElementById('lista-carrito');
const spanTotal = document.getElementById('total-a-pagar');
const botonVaciar = document.getElementById('btn-vaciar');
const botonComprar = document.getElementById('btn-comprar');
const divMensajes = document.getElementById('area-mensajes');
const mensajeVacio = document.getElementById('mensaje-vacio');


//  mostrar mensajes al usuario
function mostrarMensaje(texto) {
    divMensajes.textContent = texto;
}

// cargar el carrito desde localStorage
function cargarCarritoGuardado() {
    const carritoGuardado = localStorage.getItem('carritoGuardado');
    if (carritoGuardado) {
        miCarrito = JSON.parse(carritoGuardado);
        actualizarVistaDelCarrito(); // Actualizar la interfaz con lo cargado
    }
}

// Función para guardar el carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carritoGuardado', JSON.stringify(miCarrito));
}

// Función para mostrar los productos en la página
function mostrarProductos() {
    let htmlProductos = ''; // Variable para construir el HTML
    for (let i = 0; i < productosTienda.length; i++) {
        const producto = productosTienda[i];
        htmlProductos += `
            <div class="producto-item">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>$${producto.precio.toFixed(2)}</p>
                <button onclick="agregarAlCarrito(${producto.id})">Añadir</button>
            </div>
        `;
    }
    divProductos.innerHTML = htmlProductos; // Insertar todo el HTML de una vez
}

// Función para agregar un producto al carrito
function agregarAlCarrito(idProducto) {
    let encontrado = false;
    // Buscar si el producto ya está en el carrito
    for (let i = 0; i < miCarrito.length; i++) {
        if (miCarrito[i].id === idProducto) {
            miCarrito[i].cantidad++;
            encontrado = true;
            break; // Salir del bucle una vez encontrado
        }
    }

    if (!encontrado) {
        // Si no está, buscarlo en la tienda y añadirlo
        for (let i = 0; i < productosTienda.length; i++) {
            if (productosTienda[i].id === idProducto) {
                miCarrito.push({
                    id: productosTienda[i].id,
                    nombre: productosTienda[i].nombre,
                    precio: productosTienda[i].precio,
                    cantidad: 1
                });
                break;
            }
        }
    }
    mostrarMensaje("Producto añadido al carrito.");
    actualizarVistaDelCarrito();
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(idProducto) {
    let nuevoCarrito = [];
    for (let i = 0; i < miCarrito.length; i++) {
        if (miCarrito[i].id !== idProducto) {
            nuevoCarrito.push(miCarrito[i]);
        }
    }
    miCarrito = nuevoCarrito; // Reemplazar el carrito con el nuevo
    mostrarMensaje("Producto eliminado.");
    actualizarVistaDelCarrito();
}

// Función para actualizar la vista del carrito y el total
function actualizarVistaDelCarrito() {
    let htmlCarrito = '';
    let totalCalculado = 0;

    if (miCarrito.length === 0) {
        mensajeVacio.style.display = 'block'; // Mostrar mensaje
    } else {
        mensajeVacio.style.display = 'none'; // Ocultar mensaje
        for (let i = 0; i < miCarrito.length; i++) {
            const item = miCarrito[i];
            const subtotalItem = item.precio * item.cantidad;
            htmlCarrito += `
                <div>
                    <span>${item.nombre} (x${item.cantidad})</span>
                    <span>$${subtotalItem.toFixed(2)}</span>
                    <button onclick="eliminarDelCarrito(${item.id})">Quitar</button>
                </div>
            `;
            totalCalculado += subtotalItem;
        }
    }

    divListaCarrito.innerHTML = htmlCarrito;
    spanTotal.textContent = totalCalculado.toFixed(2);
    guardarCarrito(); // Guardar el carrito cada vez que se actualiza
}

// Función para vaciar
function vaciarTodoElCarrito() {
    if (miCarrito.length === 0) {
        mostrarMensaje("El carrito ya está vacío.");
        return;
    }
    miCarrito = []; // Vaciar el array
    mostrarMensaje("Carrito vaciado.");
    actualizarVistaDelCarrito();
}

// Función para simular la compra
function simularCompra() {
    if (miCarrito.length === 0) {
        mostrarMensaje("No hay nada en el carrito para comprar.");
        return;
    }
    mostrarMensaje("¡Compra realizada con éxito! Gracias.");
    vaciarTodoElCarrito(); // Vaciar después de comprar
}

// --- Eventos ---
// Asignar eventos a los botones principales
botonVaciar.addEventListener('click', vaciarTodoElCarrito);
botonComprar.addEventListener('click', simularCompra);

// --- Inicio de la aplicación ---
// Cargar el carrito y mostrar productos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    mostrarProductos();
    cargarCarritoGuardado();
});
