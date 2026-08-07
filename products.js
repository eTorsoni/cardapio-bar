// BANCO DE DADOS DE PRODUTOS COM IMAGENS REAIS
const products = {
    happyHour: [
        {
            id: 1,
            name: 'Isca de Frango Empanado',
            category: 'Happy Hour',
            price: 29.90,
            originalPrice: 59.90,
            imageUrl: 'img/happy-hour-1.jpg',
            badge: 'Happy Hour',
            description: 'Frango crocante e suculento, perfeito para acompanhar sua bebida',
            discount: 50
        },
        {
            id: 3,
            name: 'Chopp Amstel',
            category: 'Happy Hour',
            price: 9.90,
            originalPrice: 25.00,
            imageUrl: 'img/choop ams.jpg',
            badge: 'Popular',
            description: 'Chopp gelado e refrescante, a melhor temperatura',
            discount: 60
        },
        {
            id: 4,
            name: 'Caipirinha de Limão',
            category: 'Happy Hour',
            price: 14.90,
            originalPrice: 28.00,
            imageUrl: 'img/caipirinha.jpg',
            badge: 'Clássica',
            description: 'Clássica mistura com limão fresco e cachaça premium',
            discount: 47
        },
        {
            id: 5,
            name: 'Mojito Refrescante',
            category: 'Happy Hour',
            price: 16.90,
            originalPrice: 32.00,
            imageUrl: 'img/mojito.jpg',
            badge: 'Fresh',
            description: 'Drink cubano com hortelã fresca e rum premium',
            discount: 47
        },
        {
            id: 6,
            name: 'Água com Gás',
            category: 'Happy Hour',
            price: 5.90,
            originalPrice: 10.00,
            imageUrl: 'img/agua.jpg',
            badge: 'Refil',
            description: 'Água mineral com gás gelada, ideal para hidratação',
            discount: 41
        }
    ],
    combos: [
        {
            id: 7,
            name: 'Combo Vodka Ciroc Tradicional + 4 Red Bull',
            category: 'Combos Premium',
            price: 480.00,
            originalPrice: 540.00,
            imageUrl: 'img/ciroc og.jpg',
            badge: 'Premium',
            description: 'Vodka Ciroc autêntica combinada com 4 Red Bull gelados',
            discount: 11
        },
        {
            id: 8,
            name: 'Combo Vodka Ciroc Red Berry + 4 Red Bull',
            category: 'Combos Premium',
            price: 500.00,
            originalPrice: 560.00,
            imageUrl: 'img/ciroc vermelha.jpg',
            badge: 'Sabor',
            description: 'Vodka com sabor frutas vermelhas + 4 Red Bull energético',
            discount: 11
        },
        {
            id: 9,
            name: 'Combo Whisky Chivas + 4 Red Bull',
            category: 'Combos Premium',
            price: 420.00,
            originalPrice: 480.00,
            imageUrl: 'img/chivas.jpg',
            badge: 'Whisky',
            description: 'Whisky Chivas Regal premium com 4 Red Bull',
            discount: 13
        },
        {
            id: 10,
            name: 'Combo Whisky Jack Daniels + 4 Red Bull',
            category: 'Combos Premium',
            price: 400.00,
            originalPrice: 460.00,
            imageUrl: 'img/jack.jpg',
            badge: 'Clássico',
            description: 'Whisky americano Jack Daniels com 4 Red Bull gelado',
            discount: 13
        },
        {
            id: 11,
            name: 'Combo Whisky Jack Daniels Honey + 4 Red Bull',
            category: 'Combos Premium',
            price: 410.00,
            originalPrice: 470.00,
            imageUrl: 'img/jack mel.jpg',
            badge: 'Doce',
            description: 'Whisky com sabor de mel + 4 Red Bull refrescante',
            discount: 13
        },
        {
            id: 12,
            name: 'Combo Gin Tanqueray + 4 Red Bull',
            category: 'Combos Premium',
            price: 390.00,
            originalPrice: 450.00,
            imageUrl: 'img/tanqueray.jpg',
            badge: 'Elegante',
            description: 'Gin premium Tanqueray + 4 Red Bull premium',
            discount: 13
        },
        {
            id: 13,
            name: 'Combo Tequila Jose Cuervo + 4 Red Bull',
            category: 'Combos Premium',
            price: 430.00,
            originalPrice: 490.00,
            imageUrl: 'img/jose cuervo.jpg',
            badge: 'Mexicano',
            description: 'Tequila autêntica Jose Cuervo com 4 Red Bull gelados',
            discount: 12
        },
        {
            id: 14,
            name: 'Combo Rum Bacardi + 4 Red Bull',
            category: 'Combos Premium',
            price: 370.00,
            originalPrice: 430.00,
            imageUrl: 'img/bacardi.jpg',
            badge: 'Caribenho',
            description: 'Rum Bacardi caribenho + 4 Red Bull refrescante',
            discount: 14
        }
    ]
};
