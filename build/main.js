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
    const people = 1;
    population.ready -= people;
    const time = DAY * 0.6;
    setTimeout(bring('wood', people, 3, 0.05), time);
    buffer.loggers++;
    initBuffer();
    updateView();
    startTrail(time, 'forageTemplate', true);
};
const forage = () => {
    const people = 1;
    population.ready -= people;
    const time = DAY * 0.4;
    setTimeout(bring('foraging', people, 2, 0), time);
    buffer.foragers++;
    initBuffer();
    updateView();
    startTrail(time, 'forageTemplate', true);
};
const hunt = () => {
    const people = 2;
    population.ready -= people;
    const time = DAY * 1.2;
    setTimeout(bring('hunting', people, 8, 0.1), time);
    buffer.hunters += people;
    initBuffer();
    updateView();
    startTrail(time, 'huntTrail', true);
};
const bring = (action, partySize, amount, risk) => () => {
    buffer[action] += amount;
    initBuffer();
    const die = Math.random() < risk * attackChance;
    if (!die) {
        population.ready += partySize;
    }
    else {
        log(`Wild animals killed 1 person while ${action == 'wood' ? 'logging' : action}`, 'red', '💀', 'info');
        population.ready += partySize - 1;
        population.total -= 1;
        bury();
        blink('population', 'red');
    }
    if (!projects.weapons.unlocked && (die || action === 'hunting')) {
        projects.weapons.unlocked = true;
        log('Hunters found dangerous animals; they could use some extra protection', 'blue', '🛡', 'info');
        blink('projects', 'blink');
        renderProject('weapons');
    }
    if (action === 'foraging' && resources.food > 80 && !huntingEnabled) {
        show('#hunt');
        blink('hunt', 'blink');
        huntingEnabled = true;
        log('Animals were sighted far in the valleys, hunting may be possible.', 'blue', '🏹', 'info');
    }
    if (action === 'wood' && !projects.carpentry.unlocked && resources.wood > 5) {
        projects.carpentry.unlocked = true;
        log('Develop carpentry to process wood more efficiently', 'blue', '🔨', 'info');
        renderProject('carpentry');
        blink('projects', 'blink');
    }
    if (!smokeEnabled && action === 'wood') {
        $('animate').beginElement();
        smokeEnabled = true;
        log('The crew rejoices the arrival of wood for cooking and heating.', null, '🔥', 'info');
        dayEvents.push(() => {
            if (resources.wood > 0) {
                resources.wood = Math.max(0, resources.wood - 2);
                blink('wood', 'red');
            }
        });
    }
    updateView();
};
const setupClickHandlers = () => {
    on($('#chop-wood'), 'click', () => fetchWood());
    on($('#forage'), 'click', () => forage());
    on($('#hunt'), 'click', () => hunt());
};
const initBuffer = () => {
    clearInterval(bufferInterval);
    bufferInterval = setInterval(() => {
        if (buffer.foraging) {
            log(`+${buffer.foraging}🍒.`, 'green', '🌾', 'tasks');
            resources.food += buffer.foraging;
            buffer.foraging = 0;
            blink('food', 'green');
        }
        if (buffer.hunting) {
            log(`+${buffer.hunting}🍒.`, 'green', '🏹', 'tasks');
            resources.food += buffer.hunting;
            buffer.hunting = 0;
            blink('food', 'green');
        }
        if (buffer.wood) {
            log(`+${buffer.wood}🌳.`, 'green', '🌳', 'tasks');
            resources.wood += buffer.wood;
            buffer.wood = 0;
            blink('wood', 'green');
        }
        if (buffer.foragers) {
            log(`${buffer.foragers}👤 left for foraging.`, null, '🌾', 'tasks');
            buffer.foragers = 0;
        }
        if (buffer.hunters) {
            log(`${buffer.hunters}👥 left for hunting .`, null, '🏹', 'tasks');
            buffer.hunters = 0;
        }
        if (buffer.loggers) {
            log(`${buffer.loggers}👤 left for logging.`, null, '🌳', 'tasks');
            buffer.loggers = 0;
        }
        updateView();
    }, bufferTimeout);
};
const blink = (resource, name) => {
    $(`#${resource}`).classList.add(name);
    setTimeout(() => {
        $(`#${resource}`).classList.remove(name);
    }, name === 'no' ? 400 : 100);
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
        population.ready -= population.starving;
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
    if (resources.food < 0) {
        population.hungry = -resources.food - population.starving - starving;
        if (population.hungry > 1) {
            log(`People are getting hungry`, null, '💭', 'info');
        }
        resources.food = 0;
    }
};
const enoughPeople = (min) => {
    return (population.ready - population.starving) >= min;
};
const nextDay = () => {
    updateDate();
    updateFood();
    if ((population.total) < 1) {
        log(`Your population was decimated`, 'red', '☠️', 'info');
        stopGame();
        updateView();
        return;
    }
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
let huntingEnabled = false;
let smokeEnabled = false;
let attackChance = 1.0;
let bufferTimeout = 500;
let bufferInterval;
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
            newTrail.style.strokeDasharray = `0,${pathLength}px,${trail == 'boatTrail' ? 2 : 1}`;
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
    return;
};
const updateView = () => {
    $('#wood .value').innerText = resources.wood;
    $('#food .value').innerText = resources.food;
    $('#population .value').innerText = population.total;
    $('#ready .value').innerText = Math.max(0, population.ready - population.starving);
    $('#starving .value').innerText = population.starving;
    if (population.starving < 1) {
        $('#starving').classList.add('hidden');
    }
    else {
        $('#starving').classList.remove('hidden');
    }
    $('#forage').disabled = !enoughPeople(1);
    $('#chop-wood').disabled = !enoughPeople(1);
    $('#hunt').disabled = !enoughPeople(2);
};
const updateDate = () => {
    date.setDate(date.getDate() + 1);
    $('#days .value').innerText = `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
};
const projects = {
    fishing: {
        emoji: '🎣',
        unlocked: true,
        cost: {
            wood: 10,
            food: 10,
            people: 4,
            days: 2,
        },
        description: 'Develop fishing tools (+3 food per day)',
        callback: () => {
            log('Fishing preparations have been developed (+3 food per day).', 'blue', '🎣', 'info');
            show('#fh');
            population.ready -= 1;
            setInterval(() => {
                startTrail(DAY / 3, 'fishTrail', false);
            }, DAY / 3);
            dayEvents.push(() => {
                resources.food += 3;
                log(`+3🍒`, 'blue', '🐟', 'tasks');
            });
        }
    },
    high_sea_fishing: {
        emoji: '⛵️',
        unlocked: true,
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
        description: 'Build a fishing boat (+5 food per day).',
        callback: () => {
            population.ready -= 1;
            show('#boatTrail');
            setInterval(() => {
                startTrail(DAY / 2, 'boatTrail', false);
            }, DAY / 2);
            dayEvents.push(() => {
                resources.food += 5;
                log(`+5🍒`, 'blue', '🐟', 'tasks');
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
            log('Carpentry was perfected, building the shipyard is now possible', 'blue', '🔨', 'info');
            blink('projects', 'blink');
            show('#sy');
            renderProject('shipyard');
            renderProject('spinning_wheel');
        }
    },
    weapons: {
        emoji: '🛡',
        unlocked: false,
        description: 'Produce weapons and armor (-75% chance of animal attack deaths)',
        cost: {
            wood: 50,
            food: 15,
            people: 4,
            days: 2,
        },
        callback: () => {
            attackChance = attackChance * 0.25;
        }
    },
    spinning_wheel: {
        emoji: '🧶',
        unlocked: true,
        description: 'Some foragers will start gathering fibers, spinning into thread, producing cloth. (-50% food from foraging)',
        cost: {
            wood: 10,
            food: 20,
            people: 2,
            days: 3,
        }
    },
    shipyard: {
        emoji: '⚓',
        unlocked: true,
        requires: [
            'carpentry'
        ],
        cost: {
            wood: 100,
            food: 10,
            people: 5,
            days: 7
        },
        description: 'Build a shipyard where boats and ships can be built.',
        callback: () => {
            log('The shipyard construction has finished!', 'blue', '⚓', 'info');
            show('#sy');
            renderProject('high_sea_fishing');
        }
    },
    caravela: {
        description: 'Build a caravela and return home. Requires a shipyard, carpentry, textiles, as well as food for the trip.',
        emoji: '⚓️',
        unlocked: false,
        requires: [
            'shipyard',
            'spinning_wheel',
        ],
        cost: {
            wood: 100,
            food: 200,
            people: 10,
            days: 8,
        },
        callback: () => { }
    },
};
const projectSets = {
    foraging: ['foraging'],
    fishing: ['fishing', 'fish_boat', 'high_sea_fishing'],
    hunting: ['hunting', 'traps', 'farming']
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
  <div class="title caps">${key}</div>
  <small class="description">${project.description}</small>
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
    if (!enoughPeople(project.cost.people)) {
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
const pauseGame = () => {
    clearInterval(dayInterval);
    clearInterval(dayCycleInterval);
    $('#days').classList.add('paused');
};
const resumeGame = () => {
    dayInterval = setInterval(nextDay, DAY);
    dayCycleInterval = setInterval(dayCycle, DAY / 2);
    $('#days').classList.remove('paused');
};
const startGame = () => {
    resumeGame();
    updateDate();
    updateView();
    renderProject('caravela');
    initBuffer();
    setupClickHandlers();
    log('Your people set camp by the sea.', null, '⛺️', 'info');
    setTimeout(() => {
        log('A scouting team has found good foraging grounds nearby.', 'blue', '🌾', 'info');
        show('#forage');
        blink('forage', 'blink');
    }, 2000);
    setTimeout(() => {
        log('Rudimentary axes make it now possible to gather wood.', 'blue', '🌳', 'info');
        show('#chop-wood');
        blink('chop-wood', 'blink');
    }, DAY);
    setTimeout(() => {
        log('The river delta could provide you with food if you would develop fishing.', 'blue', '🐟', 'info');
        blink('projects', 'blink');
        renderProject('fishing');
    }, DAY * 2);
    on($('#projects'), 'click', () => {
        if ($('.projects').classList.contains('closed')) {
            pauseGame();
        }
        else {
            resumeGame();
        }
        $('.projects').classList.toggle('closed');
    });
};
on($('.intro button'), 'click', () => {
    $('.intro').classList.add('closed');
    $('#sail').beginElement();
    setTimeout(() => {
        $('#sink').beginElement();
    }, 2000);
    document.body.style.setProperty('--v', '1');
    setTimeout(startGame, 3000);
});
