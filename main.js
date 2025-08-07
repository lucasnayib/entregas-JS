// Definición de la clase Producto
class Product {
    constructor(id, name, price, image) {
        this.id = id;
        this.name = name;
        this.price = parseFloat(price);
        this.image = image;
    }

    getPriceWithIVA() {
        const IVA_RATE = 0.21;
        return this.price * (1 + IVA_RATE);
    }
}

let products = [];
let cart = [];

const productContainer = document.getElementById('productContainer');
const cartCountSpan = document.getElementById('cartCount');
const viewCartBtn = document.getElementById('viewCartBtn');
const cartModal = document.getElementById('cartModal');
const closeModalBtn = document.querySelector('.close-button');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalSpan = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');

// Cargar productos desde un archivo JSON
const loadProducts = async () => {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        products = data.map(item => new Product(item.id, item.name, item.price, item.image));
        renderProducts();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar productos',
            text: 'No se pudieron cargar los productos. Inténtalo de nuevo más tarde.',
        });
        console.error('Error al cargar los productos:', error);
    }
};

const renderProducts = () => {
    productContainer.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <h3>${product.name}</h3>
            <p>$${product.price.toFixed(2)}</p>
            <button data-id="${product.id}">Agregar al Carrito</button>
        `;
        productContainer.appendChild(productCard);

        const addButton = productCard.querySelector('button');
        addButton.addEventListener('click', () => addToCart(product.id));
    });
};

const renderCart = () => {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>El carrito está vacío.</p>';
    } else {
        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.innerHTML = `
                <span>${item.name} x ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                <button data-id="${item.id}" title="Eliminar del carrito">Eliminar</button>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
            total += item.price * item.quantity;

            const removeButton = cartItemDiv.querySelector('button');
            removeButton.addEventListener('click', () => removeFromCart(item.id));
        });
    }

    cartTotalSpan.textContent = total.toFixed(2);
    cartCountSpan.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
    saveCartToLocalStorage();
};

const addToCart = (productId) => {
    const productToAdd = products.find(product => product.id === productId);

    if (productToAdd) {
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
        }
        renderCart();
        Swal.fire({
            icon: 'success',
            title: 'Producto Agregado',
            text: `${productToAdd.name} ha sido añadido al carrito.`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
        });
    }
};

const removeFromCart = (productId) => {
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity--;
        } else {
            cart.splice(itemIndex, 1);
        }
        renderCart();
        Swal.fire({
            icon: 'info',
            title: 'Producto Eliminado',
            text: 'Se ha actualizado la cantidad o eliminado el producto del carrito.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
        });
    }
};

const clearCart = () => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Se eliminarán todos los productos del carrito.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'No, cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            cart = [];
            renderCart();
            Swal.fire('Vaciado!', 'Tu carrito ha sido vaciado.', 'success');
            cartModal.style.display = 'none';
        }
    });
};

const checkout = () => {
    if (cart.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Carrito Vacío',
            text: 'No hay productos en tu carrito para finalizar la compra.',
        });
        return;
    }

    Swal.fire({
        title: 'Confirmar Compra',
        text: `El total es $${cartTotalSpan.textContent}. ¿Deseas continuar?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, comprar',
        cancelButtonText: 'No, cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Procesando Pago...',
                text: 'Por favor, espera un momento.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                timer: 2000,
                timerProgressBar: true
            }).then(() => {
                cart = [];
                renderCart();
                Swal.fire('¡Compra Exitosa!', 'Gracias por tu compra. Tu pedido ha sido procesado.', 'success');
                cartModal.style.display = 'none';
            });
        }
    });
};

const saveCartToLocalStorage = () => {
    try {
        const cartData = JSON.stringify(cart);
        window.cartStorage = cartData;
    } catch (error) {
        console.error('Error al guardar el carrito:', error);
    }
};

const loadCartFromLocalStorage = () => {
    try {
        const storedCart = window.cartStorage;
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
        cart = [];
    }
};

viewCartBtn.addEventListener('click', () => {
    cartModal.style.display = 'block';
    renderCart();
});

closeModalBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && cartModal.style.display === 'block') {
        cartModal.style.display = 'none';
    }
});

checkoutBtn.addEventListener('click', checkout);
clearCartBtn.addEventListener('click', clearCart);

const initApp = () => {
    loadCartFromLocalStorage();
    loadProducts();
    renderCart();
};

document.addEventListener('DOMContentLoaded', initApp);
