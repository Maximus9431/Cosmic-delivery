export const solarSystemPlanets = [
    {
        id: 0,
        name: "Меркурий",
        description: "Ближайшая к Солнцу планета. Поверхность покрыта кратерами.",
        color: 0x8C7853,
        atmosphereColor: 0xA9A9A9,
        scale: 0.4,
        radius: 2439.7,
        gravity: 0.38,
        temperature: "167°C",
        bonus: 1.0,
        cost: 0,
        unlocked: true,
        texture: "mercury.png",
        cameraDistance: 6
    },
    {
        id: 1,
        name: "Венера",
        description: "Вторая планета от Солнца. Имеет плотную атмосферу.",
        color: 0xFFC649,
        atmosphereColor: 0xFFD700,
        scale: 0.95,
        radius: 6051.8,
        gravity: 0.91,
        temperature: "464°C",
        bonus: 1.5,
        cost: 500,
        unlocked: false,
        texture: "venus.png",
        cameraDistance: 10
    },
    {
        id: 2,
        name: "Земля",
        description: "Третья планета от Солнца. Единственная с жизнью.",
        color: 0x1E90FF,
        atmosphereColor: 0x4da6ff,
        scale: 1.0,
        radius: 6371,
        gravity: 1.0,
        temperature: "15°C",
        bonus: 2.0,
        cost: 2000,
        unlocked: false,
        texture: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg",
        normalMap: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg",
        moons: [
            { name: "Луна", size: 0.27, distance: 3.8, color: 0xC0C0C0, texture: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg" }
        ],
        cameraDistance: 12
    },
    {
        id: 3,
        name: "Марс",
        description: "Четвертая планета. Известна как 'Красная планета'.",
        color: 0xFF4500,
        atmosphereColor: 0xFF8C00,
        scale: 0.53,
        radius: 3389.5,
        gravity: 0.38,
        temperature: "-63°C",
        bonus: 2.5,
        cost: 5000,
        unlocked: false,
        texture: "mars.png",
        moons: [
            { name: "Фобос", size: 0.1, distance: 2.8, color: 0x8B4513 },
            { name: "Деймос", size: 0.08, distance: 4.0, color: 0x696969 }
        ],
        cameraDistance: 10
    },
    {
        id: 4,
        name: "Юпитер",
        description: "Пятая планета, газовый гигант. Крупнейшая планета.",
        color: 0xFFA500,
        atmosphereColor: 0xFFB84D,
        scale: 2.5,
        radius: 69911,
        gravity: 2.53,
        temperature: "-108°C",
        bonus: 4.0,
        cost: 15000,
        unlocked: false,
        texture: "jupiter.png",
        moons: [
            { name: "Ио", size: 0.29, distance: 4.2, color: 0xFFFF00 },
            { name: "Европа", size: 0.25, distance: 5.0, color: 0x87CEEB },
            { name: "Ганимед", size: 0.41, distance: 6.5, color: 0xD3D3D3 },
            { name: "Каллисто", size: 0.38, distance: 8.0, color: 0x8B4513 }
        ],
        cameraDistance: 35
    },
    {
        id: 5,
        name: "Сатурн",
        description: "Шестая планета, известная своими кольцами.",
        color: 0xF4A460,
        atmosphereColor: 0xF5DEB3,
        scale: 2.1,
        radius: 58232,
        gravity: 1.07,
        temperature: "-139°C",
        bonus: 6.0,
        cost: 30000,
        unlocked: false,
        texture: "saturn.png",
        hasRings: true,
        moons: [
            { name: "Мимас", size: 0.1, distance: 3.5, color: 0xFFFFFF },
            { name: "Энцелад", size: 0.15, distance: 4.0, color: 0xE6E6FA },
            { name: "Титан", size: 0.4, distance: 6.0, color: 0xFFA500 }
        ],
        cameraDistance: 45
    },
    {
        id: 6,
        name: "Уран",
        description: "Седьмая планета, ледяной гигант.",
        color: 0xAFEEEE,
        atmosphereColor: 0x87CEEB,
        scale: 1.8,
        radius: 25362,
        gravity: 0.89,
        temperature: "-197°C",
        bonus: 8.0,
        cost: 50000,
        unlocked: false,
        texture: "uranus.png",
        moons: [
            { name: "Миранда", size: 0.12, distance: 4.0, color: 0x87CEEB },
            { name: "Ариэль", size: 0.18, distance: 5.0, color: 0xE0FFFF },
            { name: "Титания", size: 0.25, distance: 6.5, color: 0xC0C0C0 }
        ],
        cameraDistance: 35
    },
    {
        id: 7,
        name: "Нептун",
        description: "Восьмая планета, ледяной гигант.",
        color: 0x0000CD,
        atmosphereColor: 0x1E90FF,
        scale: 1.7,
        radius: 24622,
        gravity: 1.14,
        temperature: "-201°C",
        bonus: 10.0,
        cost: 75000,
        unlocked: false,
        texture: "https://raw.githubusercontent.com/PavelDoGreat/Three-JS-Planets/master/src/assets/neptune.jpg",
        moons: [
            { name: "Тритон", size: 0.21, distance: 5.0, color: 0x87CEEB }
        ],
        cameraDistance: 30
    },
    {
        id: 8,
        name: "Плутон",
        description: "Карликовая планета в поясе Койпера.",
        color: 0xA0522D,
        scale: 0.2,
        radius: 1188.3,
        gravity: 0.06,
        temperature: "-229°C",
        bonus: 15.0,
        cost: 100000,
        unlocked: false,
        texture: "pluto.png",
        cameraDistance: 5
    }
];

export const initialUpgrades = {
    robot: {
        level: 0,
        cost: 100,
        name: "Робот-геолог",
        description: "Автоматически собирает минеральные посылки",
        icon: "robot",
        effectText: "+5 посылка/сек за уровень",
        maxLevel: 50
    },
    speed: {
        level: 0,
        cost: 250,
        name: "Ионный двигатель",
        description: "Увеличивает скорость доставки и шанс редких посылок",
        icon: "zap",
        effectText: "+20% скорость, +5% редкие посылки",
        maxLevel: 30
    },
    scanner: {
        level: 0,
        cost: 500,
        name: "Спектральный сканер",
        description: "Обнаруживает ценные минералы и увеличивает комбо",
        icon: "search",
        effectText: "+50% ценность, +0.5x комбо",
        maxLevel: 25
    },
    hangar: {
        level: 0,
        cost: 750,
        name: "Орбитальный ангар",
        description: "Дроны для автоматического сбора",
        icon: "satellite",
        effectText: "+1 дрон, +10% эффективность",
        maxLevel: 20
    },
    teleport: {
        level: 0,
        cost: 1000,
        name: "Квантовый телепорт",
        description: "Мгновенная доставка ресурсов",
        icon: "atom",
        effectText: "10% шанс x3 награды за уровень",
        maxLevel: 15
    },
    shield: {
        level: 0,
        cost: 2000,
        name: "Магнитосферный щит",
        description: "Защищает от солнечной радиации",
        icon: "shield",
        effectText: "+30% к доходу за уровень",
        maxLevel: 10
    },
    quantum: {
        level: 0,
        cost: 5000,
        name: "Квантовый ускоритель",
        description: "Увеличивает все бонусы и дает пассивный доход",
        icon: "rocket",
        effectText: "+100% бонусы, +50/с",
        maxLevel: 5
    },
    nexus: {
        level: 0,
        cost: 10000,
        name: "Нексус-станция",
        description: "Создает редкие посылки и увеличивает опыт",
        icon: "spaceStation",
        effectText: "+1 редкая/мин, +50% опыт",
        maxLevel: 3
    }
};

export const initialMissions = [
    {
        id: 1,
        title: "Первая экспедиция",
        description: "Соберите 10 космических посылок",
        target: 10,
        progress: 0,
        reward: 500,
        completed: false
    },
    {
        id: 2,
        title: "Исследователь",
        description: "Заработайте 5000 космических кредитов",
        target: 5000,
        progress: 0,
        reward: 2000,
        completed: false
    },
    {
        id: 3,
        title: "Колонизатор",
        description: "Откройте 3 новые планеты",
        target: 3,
        progress: 0,
        reward: 5000,
        completed: false
    },
    {
        id: 4,
        title: "Мастер доставки",
        description: "Доставьте 100 межпланетных посылок",
        target: 100,
        progress: 0,
        reward: 10000,
        completed: false
    },
    {
        id: 5,
        title: "Космический магнат",
        description: "Накопите 50,000 космических кредитов",
        target: 50000,
        progress: 0,
        reward: 25000,
        completed: false
    },
    {
        id: 6,
        title: "Улучшатель",
        description: "Купите 10 улучшений в космопорту",
        target: 10,
        progress: 0,
        reward: 15000,
        completed: false
    },
    {
        id: 7,
        title: "Исследователь системы",
        description: "Откройте все планеты (9)",
        target: 9,
        progress: 0,
        reward: 50000,
        completed: false
    },
    {
        id: 8,
        title: "Временной пилот",
        description: "Играйте 1 час в игре",
        target: 3600,
        progress: 0,
        reward: 10000,
        completed: false
    }
];
