// Product data is loaded from products.js
const fallbackProductImage = 'data:image/jpeg;base64,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'

// VARIÁVEIS GLOBAIS
let cart = [];
const DELIVERY_COST = 15.00;

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    setupEventListeners();
    loadCartFromStorage();
    updateCartCount();
});

// RENDERIZAR PRODUTOS
function renderProducts() {
    const happyHourMenu = document.getElementById('happyHourMenu');
    const combosMenu = document.getElementById('combosMenu');

    // Happy Hour
    products.happyHour.forEach(product => {
        happyHourMenu.appendChild(createProductCard(product));
    });

    // Combos
    products.combos.forEach(product => {
        combosMenu.appendChild(createProductCard(product));
    });
}

// CRIAR CARD DE PRODUTO
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-badge">${product.badge}</div>
        <div class="product-image-wrapper">
            <img class="product-image" src="${product.imageUrl}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src=fallbackProductImage;">
        </div>
        <div class="product-info">
            <div class="product-category">${product.category}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-description">${product.description}</div>
            <div class="price-section">
                <span class="original-price">R$ ${product.originalPrice.toFixed(2)}</span>
                <span class="current-price">R$ ${product.price.toFixed(2)}</span>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                Adicionar ao Carrinho
            </button>
        </div>
    `;
    return card;
}

// ADICIONAR AO CARRINHO
function addToCart(productId) {
    // Encontrar produto
    let product = null;
    for (let key in products) {
        product = products[key].find(p => p.id === productId);
        if (product) break;
    }

    if (!product) return;

    // Verificar se já está no carrinho
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCartToStorage();
    updateCartCount();
    showCartAddedAnimation();
}

// ANIMAÇÃO DE PRODUTO ADICIONADO
function showCartAddedAnimation() {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Adicionado!';
    btn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 1500);
}

// ATUALIZAR CONTAGEM DO CARRINHO
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.cart-count').textContent = totalItems;
}

// CONFIGURAR EVENT LISTENERS
function setupEventListeners() {
    const cartBtn = document.getElementById('cartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartModal = document.getElementById('cartModal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const confirmCloseBtn = document.getElementById('confirmCloseBtn');

    cartBtn.addEventListener('click', () => {
        openCart();
    });

    closeCartBtn.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });

    checkoutBtn.addEventListener('click', finalizePurchase);
    confirmCloseBtn.addEventListener('click', () => {
        document.getElementById('confirmModal').classList.remove('active');
        cart = [];
        saveCartToStorage();
        updateCartCount();
        document.getElementById('cartModal').classList.remove('active');
        renderCartItems();
    });

    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
    });
}

// ABRIR CARRINHO
function openCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.add('active');
    renderCartItems();
    updateCartSummary();
}

// RENDERIZAR ITENS DO CARRINHO
function renderCartItems() {
    const cartItemsDiv = document.getElementById('cartItems');

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
        document.querySelector('.checkout-form').classList.remove('active');
        return;
    }

    cartItemsDiv.innerHTML = '';
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-qty">Quantidade: ${item.quantity}</div>
            </div>
            <div class="cart-item-price">R$ ${itemTotal.toFixed(2)}</div>
            <button class="remove-btn" onclick="removeFromCart(${index})">
                Remover
            </button>
        `;
        cartItemsDiv.appendChild(cartItem);
    });

    document.querySelector('.checkout-form').classList.add('active');
}

// REMOVER DO CARRINHO
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCartToStorage();
    updateCartCount();
    renderCartItems();
    updateCartSummary();

    if (cart.length === 0) {
        document.querySelector('.checkout-form').classList.remove('active');
    }
}

// ATUALIZAR RESUMO DO CARRINHO
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = cart.length > 0 ? DELIVERY_COST : 0;
    const total = subtotal + delivery;

    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('delivery').textContent = `R$ ${delivery.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;
}

// FINALIZAR COMPRA
function finalizePurchase() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();

    // Validação
    if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (!validateEmail(customerEmail)) {
        alert('Por favor, insira um e-mail válido!');
        return;
    }

    if (!validatePhone(customerPhone)) {
        alert('Por favor, insira um telefone válido!');
        return;
    }

    // Criar resumo do pedido
    const orderSummary = createOrderSummary(customerName, customerEmail, customerPhone, customerAddress);

    // Mostrar confirmação
    showConfirmation(orderSummary);

    // Limpar formulário
    document.getElementById('customerName').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
}

// CRIAR RESUMO DO PEDIDO
function createOrderSummary(name, email, phone, address) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = DELIVERY_COST;
    const total = subtotal + delivery;

    let itemsText = '';
    cart.forEach(item => {
        itemsText += `\n• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`;
    });

    return {
        number: Math.floor(Math.random() * 100000),
        name: name,
        email: email,
        phone: phone,
        address: address,
        items: itemsText,
        subtotal: subtotal.toFixed(2),
        delivery: delivery.toFixed(2),
        total: total.toFixed(2),
        date: new Date().toLocaleString('pt-BR')
    };
}

// MOSTRAR CONFIRMAÇÃO
function showConfirmation(orderSummary) {
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');

    confirmMessage.innerHTML = `
        <strong>Pedido #${orderSummary.number} realizado com sucesso!</strong><br><br>
        <strong>Dados do Cliente:</strong><br>
        Nome: ${orderSummary.name}<br>
        E-mail: ${orderSummary.email}<br>
        Telefone: ${orderSummary.phone}<br>
        Endereço: ${orderSummary.address}<br><br>
        <strong>Itens do Pedido:${orderSummary.items}</strong><br><br>
        <strong>Valores:</strong><br>
        Subtotal: R$ ${orderSummary.subtotal}<br>
        Entrega: R$ ${orderSummary.delivery}<br>
        <strong>Total: R$ ${orderSummary.total}</strong><br><br>
        Obrigado pela compra!
    `;

    confirmModal.classList.add('active');
}

// VALIDAÇÕES
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePhone(phone) {
    const regex = /^[\d\s\-\+\(\)]+$/;
    return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// ARMAZENAMENTO LOCAL
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}
