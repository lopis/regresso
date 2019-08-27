const $ = q => document.querySelector(q);
const on = (elem, event, callback) => elem.addEventListener(event, callback);
const $$ = (tag, className, innerText) => {
    const el = document.createElement(tag);
    el.classList.add(className);
    el.innerText = innerText;
    return el;
};
const log = (text, color, emoji, type) => {
    if ($(`.log#${type} .new`)) {
        setTimeout(() => log(text, color, emoji, type), 500);
        return;
    }
    const newLog = document.createElement('p');
    newLog.innerHTML = `<span class="icon">${emoji}</span><span class="${color}">${text}</span>`;
    if (color)
        newLog.classList.add(color);
    newLog.classList.add('new');
    $(`.log#${type}`).prepend(newLog);
    setTimeout(() => {
        newLog.classList.remove('new');
    }, 200);
};
const show = (q) => {
    $(q).style.visibility = 'visible';
};
const shuffle = (array) => {
    let i = 0, j = 0, temp = null;
    for (i = array.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
};
const buffer = {
    foragers: 0,
    foraging: 0,
    hunters: 0,
    hunting: 0,
    loggers: 0,
    wood: 0,
};
const fetchWood = () => {
    population.ready -= -1;
    const time = DAY * 0.6;
    setTimeout(bring('wood', 1, 3, 0.05), time);
    buffer.loggers++;
    updateView();
    startTrail(time, 'forageTemplate', true);
    if (!projects.carpentry.unlocked && resources.wood > 5) {
        projects.carpentry.unlocked = true;
        log('Develop carpentry to process wood more efficiently', 'blue', '🔨', 'info');
        renderProject('carpentry');
        blink('projects', 'blink');
    }
};
let huntingEnabled = false;
const forage = () => {
    population.ready -= 1;
    const time = DAY * 0.4;
    setTimeout(bring('foraging', 1, 2, 0), time);
    buffer.foragers++;
    updateView();
    startTrail(time, 'forageTemplate', true);
    if (resources.food > 100 && !huntingEnabled) {
        show('#hunt');
        blink('hunt', 'blink');
        huntingEnabled = true;
        log('Animals were sighted far in the valleys, hunting may be possible.', 'blue', '🏹', 'info');
    }
};
const hunt = () => {
    population.ready -= 1;
    const time = DAY * 1.2;
    setTimeout(bring('hunting', 1, 4, 0.1), time);
    buffer.hunters++;
    updateView();
    startTrail(time, 'huntTrail', true);
    if (!projects.weapons.unlocked) {
        projects.weapons.unlocked = true;
        log('Hunters found dangerous animals; they could use some extra protection', 'blue', '🛡', 'info');
        blink('projects', 'blink');
        renderProject('weapons');
    }
};
let attackChance = 1.0;
const bring = (resource, partySize, amount, risk) => () => {
    buffer[resource] += amount;
    if (Math.random() > risk * attackChance) {
        population.ready += partySize;
    }
    else {
        log(`A party got attacked by wild animals while ${resource == 'wood' ? 'logging' : resource}. 1 person died`, 'red', '💀', 'info');
        population.ready += partySize - 1;
        population.total -= 1;
        bury();
        blink('population', 'red');
    }
    updateView();
};
const setupClickHandlers = () => {
    on($('#chop-wood'), 'click', () => fetchWood());
    on($('#forage'), 'click', () => forage());
    on($('#hunt'), 'click', () => hunt());
};
const initBuffer = () => {
    setInterval(() => {
        if (buffer.foraging) {
            log(`Foragers have collected ${buffer.foraging} food.`, 'green', '🌾', 'tasks');
            resources.food += buffer.foraging;
            buffer.foraging = 0;
            blink('food', 'green');
        }
        if (buffer.hunting) {
            log(`Hunters have hunted ${buffer.hunting} food.`, 'green', '🏹', 'tasks');
            resources.food += buffer.hunting;
            buffer.hunting = 0;
            blink('food', 'green');
        }
        if (buffer.wood) {
            log(`Loggers have brought back ${buffer.wood} wood.`, 'green', '🌳', 'tasks');
            resources.wood += buffer.wood;
            buffer.wood = 0;
            blink('wood', 'green');
        }
        if (buffer.foragers) {
            log(`${buffer.foragers} people went foraging for food.`, null, '🌾', 'tasks');
            buffer.foragers = 0;
        }
        if (buffer.hunters) {
            log(`${buffer.hunters} people left to search game to hunt.`, null, '🏹', 'tasks');
            buffer.hunters = 0;
        }
        if (buffer.loggers) {
            log(`${buffer.loggers} people set off to bring wood.`, null, '🌳', 'tasks');
            buffer.loggers = 0;
        }
    }, 1500);
};
const blink = (resource, name) => {
    $(`#${resource}`).classList.add(name);
    setTimeout(() => {
        $(`#${resource}`).classList.remove(name);
    }, name === 'no' ? 400 : 100);
};
const updateView = () => {
    $('#wood .value').innerText = resources.wood;
    $('#food .value').innerText = resources.food;
    $('#population .value').innerText = population.total;
    $('#ready .value').innerText = population.ready;
    $('#starving .value').innerText = population.starving;
    if (population.starving < 1) {
        $('#starving').classList.add('hidden');
    }
    else {
        $('#starving').classList.remove('hidden');
    }
    $('#forage').disabled = population.ready < 2;
    $('#chop-wood').disabled = population.ready < 2;
    $('#hunt').disabled = population.ready < 4;
};
const updateDate = () => {
    date.setDate(date.getDate() + 1);
    $('#days .value').innerText = `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
};
const updateFood = () => {
    let food = resources.food;
    let starving = Math.max(0, population.starving - food);
    food = Math.max(0, food - starving);
    let hungry = Math.max(0, population.hungry - food);
    food = Math.max(0, food - hungry);
    population.starving = starving;
    population.hungry = hungry;
    resources.food -= population.total;
    if (population.starving > 0) {
        log(`${population.starving} died from starvation.`, 'red', '💀', 'info');
        population.total -= population.starving;
        blink('food', 'green');
        blink('population', 'red');
        bury();
        population.starving = 0;
    }
    if (population.hungry > 0) {
        population.starving = population.hungry;
        population.hungry = 0;
        log(`Due to lack of food, ${population.starving} are starving and can't work.`, 'red', '😔', 'info');
    }
    population.ready = population.total - population.starving;
    if (resources.food < 0) {
        population.hungry = -resources.food - population.starving - starving;
        resources.food = 0;
    }
};
const nextDay = () => {
    updateDate();
    if ((population.total) < 1) {
        log(`Your population was decimated`, 'red', '☠️', 'info');
        stopGame();
    }
    updateFood();
    dayEvents.forEach(event => event());
    updateView();
};
const dayCycle = () => {
    $('svg').classList.toggle('night');
};
const resources = {
    wood: 0,
    food: 0,
};
const population = {
    total: 15,
    ready: 15,
    hungry: 0,
    starving: 0,
    hurt: 0,
};
const people = shuffle([
    {
        name: 'Abraão'
    },
    {
        name: 'Bartolomeu'
    },
    {
        name: 'João'
    },
    {
        name: 'Jacinto'
    },
    {
        name: 'Paulo'
    },
    {
        name: 'Lindomar'
    },
    {
        name: 'Isaías'
    },
    {
        name: 'Henrique'
    },
    {
        name: 'Tomás'
    },
    {
        name: 'Amélia'
    },
    {
        name: 'Camila'
    },
    {
        name: 'Benedita'
    },
    {
        name: 'Madalena'
    },
    {
        name: 'Teresa'
    },
    {
        name: 'Lúcia'
    },
]);
const dayEvents = [];
const DAY = 10000;
let date = new Date('1549/05/13');
let trailCount = 0;
const startTrail = (time, trail, clone) => {
    const newTrail = clone ? $(`#${trail}`).cloneNode() : $(`#${trail}`);
    let id = trail;
    if (clone) {
        id = 'trail' + (++trailCount);
        newTrail.id = id;
        $(`#${trail}`).after(newTrail);
    }
    setTimeout(() => {
        const pathLength = Math.round($(`#${trail}`).getTotalLength());
        if (trail == 'huntTrail') {
            newTrail.style.strokeDasharray = `0,${pathLength}px,0.5,1,0.5,1,0.5,1,0.5,100%`;
        }
        else {
            newTrail.style.strokeDasharray = `0,${pathLength}px,1`;
        }
    }, 100);
    setTimeout(() => {
        $(`#${id}`).style.strokeDasharray = null;
    }, time / 2);
    if (clone) {
        setTimeout(() => {
            $(`#${id}`).remove();
        }, time);
    }
};
const bury = () => {
    const index = $('#crosses').children.length - population.total;
    if ($('#crosses').children[index]) {
        $('#crosses').children[index].style.display = 'initial';
    }
};
const projects = {
    caravela: {
        description: 'Build a caravela and return home. Requires a shipyard, carpentry, textiles, as well as food for the trip.',
        emoji: '⚓️',
        unlocked: false,
        cost: {
            wood: 100,
            food: 200,
            people: 10,
            days: 8,
        },
        callback: () => { }
    },
    fishing: {
        emoji: '🎣',
        unlocked: true,
        cost: {
            wood: 10,
            food: 10,
            people: 4,
            days: 2,
        },
        description: 'Develop fishing tools (+5 food per day)',
        callback: () => {
            log('Fishing preparations have been developed (+5 food per day).', 'blue', '🎣', 'info');
            show('#fh');
            population.ready -= 1;
            setInterval(() => {
                startTrail(DAY / 2, 'fishTrail', false);
            }, DAY / 2);
            dayEvents.push(() => {
                resources.food += 5;
            });
        }
    },
    carpentry: {
        emoji: '🔨',
        unlocked: false,
        cost: {
            wood: 10,
            food: 10,
            people: 4,
            days: 2,
        },
        description: 'Recycle and process wood more efficiently (+1 wood per day)',
        callback: () => {
            renderProject('shipyard');
        }
    },
    weapons: {
        emoji: '🛡',
        unlocked: false,
        description: 'Produce weapons and armor (-75% chance of animal attacks)',
        cost: {
            wood: 50,
            food: 15,
            people: 4,
            days: 2,
        },
        callback: () => {
            attackChance = attackChance * 0.5;
        }
    },
    shipyard: {
        emoji: '⚓',
        unlocked: false,
        requires: [
            'carpentry'
        ],
        cost: {
            wood: 100,
            food: 10,
            people: 5,
            days: 7
        },
        description: 'Build a shipyard where boats and ships can be built.'
    },
    high_sea_fishing: {
        emoji: '⛵️',
        unlocked: false,
        requires: [
            'shipyard',
            'fishing'
        ],
        cost: {
            wood: 25,
            food: 10,
            people: 5,
            days: 5
        },
        description: 'Build a fishing boat, bringing 10 extra food per day.'
    },
};
const createProjects = () => {
    Object.keys(projects).forEach(key => {
        if (projects[key].unlocked) {
            renderProject(key);
        }
    });
};
const resourceEmoji = {
    wood: '🌳',
    food: '🍒',
    days: 'days ⏳',
    people: '👫'
};
const getCostString = (cost) => {
    return Object.keys(cost)
        .map(key => `${cost[key]} ${resourceEmoji[key]}`)
        .join('  ');
};
const renderProject = (key) => {
    const project = projects[key];
    const $newProject = $$('div', 'project', null);
    $newProject.id = key;
    $newProject.innerHTML = `
  <div class="icon">${project.emoji}</div>
  <div class="title">${key}</div>
  <div class="description">${project.description}</div>
  <div class="cost">${getCostString(project.cost)}</div>`;
    $('.projects').append($newProject);
    on($newProject, 'click', selectProject(key));
};
const updateProjects = () => {
};
const selectProject = (projectName) => () => {
    const project = projects[projectName];
    if (project.done) {
        return;
    }
    if (!project.unlocked) {
        blink(projectName, 'no');
        log('Conditions for construction of the new caravela have not been met.', null, '❌', 'info');
        return;
    }
    const missing = ['wood', 'food'].filter(resource => resources[resource] < project.cost[resource]);
    if (population.ready < project.cost.people) {
        log(`Not enough people ready to start the ${projectName} project`, null, '❌', 'info');
        return;
    }
    if (missing.length > 0) {
        blink(projectName, 'no');
        log(`There is not enough ${missing.join(' and ')} to start the ${projectName} project`, null, '❌', 'info');
        return;
    }
    resources.wood -= project.cost.wood;
    resources.food -= project.cost.food;
    population.ready -= project.cost.people;
    project.done = true;
    const $project = $(`.project#${projectName}`);
    const duration = project.cost.days * DAY;
    $project.style.transition = `height ${duration}ms linear`;
    $project.classList.add('in-progress');
    setTimeout(() => {
        $project.classList.add('done');
        $project.classList.remove('in-progress');
        $project.style.transition = null;
        population.ready += project.cost.people;
        project.callback();
        updateProjects();
    }, duration);
};
let dayInterval, dayCycleInterval;
const stopGame = () => {
    clearInterval(dayInterval);
    clearInterval(dayCycleInterval);
    $('svg').style.filter = 'brightness(.5) contrast(1.0) saturate(0)';
};
window.onload = () => {
    dayInterval = setInterval(nextDay, DAY);
    dayCycleInterval = setInterval(dayCycle, DAY / 2);
    updateDate();
    updateView();
    renderProject('caravela');
    initBuffer();
    setupClickHandlers();
    log('Your ship wrecked on an unkown land. Help your remaining crew return to the seas.', null, '🏝', 'info');
    setTimeout(() => {
        log('A scouting team has found good foraging grounds nearby.', 'blue', '🌾', 'info');
        show('#forage');
        blink('forage', 'blink');
    }, 2000);
    setTimeout(() => {
        log('By crafting simple tools, logging and wood working is now possible.', 'blue', '🌳', 'info');
        show('#chop-wood');
        blink('chop-wood', 'blink');
    }, DAY);
    setTimeout(() => {
        log('The river delta could provide you with food if you would develop fishing.', 'blue', '🐟', 'info');
        blink('projects', 'blink');
        renderProject('fishing');
    }, DAY * 2);
};
