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
    return array;
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
const pray = () => {
    population.ready -= 1;
    isPraying = true;
    setTimeout(() => {
        population.ready += 1;
        isPraying = false;
        godSatisfaction += 0.05;
        const person = people[Math.round(Math.random() * people.length) - 1];
        log(`${person.name} is feeling envigorated after a day at the house of God. Praise the Lord!`, null, '✝️', 'info');
    }, DAY);
};
const forage = () => {
    const people = 1;
    population.ready -= people;
    const time = DAY * 0.4;
    setTimeout(bring('foraging', people, foragingReturns, 0), time);
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
const leave = () => {
    log(`${population.total} people board the caravela and get ready for departure`, null, '⛵️', 'info');
    $('#newShip').classList.add('go');
    if (godSatisfaction < Math.random()) {
        setTimeout(() => {
            log('A violent storm suddenly forms. The ship capsizes and sinks. There are no survivors.', null, '⛈', 'info');
            stopGame();
        }, 7000);
    }
    else {
        setTimeout(() => {
            log('The journey back was long. They experienced perfect weather and ideal winds.', null, '🌤', 'info');
            log('Fim.', null, '🌅', 'info');
        }, 7000);
    }
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
    on($('#chop-wood'), 'click', fetchWood);
    on($('#forage'), 'click', forage);
    on($('#hunt'), 'click', hunt);
    on($('#pray'), 'click', pray);
    on($('#leave'), 'click', leave);
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
    let diff = resources.food - population.total;
    if (diff >= 0) {
        population.hungry = population.starving;
        population.starving = 0;
        resources.food = diff;
    }
    else {
        const dead = Math.min(population.starving, -diff);
        if (dead > 0) {
            log(`${dead} died from starvation.`, 'red', '💀', 'info');
            population.total -= dead;
            population.ready -= dead;
            population.starving = 0;
            blink('population', 'red');
            bury();
        }
        const starving = Math.min(population.hungry, -diff);
        if (starving > 0) {
            population.starving = starving;
            log(`${starving} are starving and can't work.`, 'red', '😔', 'info');
        }
        else {
            log(`People are getting hungry`, null, '💭', 'info');
        }
        population.hungry = Math.min(population.total - starving, -diff);
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
    $('#island').classList.toggle('night');
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
    fishers: 0
};
let foragingReturns = 2;
let huntingEnabled = false;
let smokeEnabled = false;
let attackChance = 1.0;
let bufferTimeout = 300;
let bufferInterval;
let godSatisfaction = 0.1;
let isPraying = false;
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
let date = new Date('1549/08/13');
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
    $('#fishers .value').innerText = population.fishers;
    if (population.fishers < 1) {
        $('#fishers').classList.add('hidden');
    }
    else {
        $('#fishers').classList.remove('hidden');
    }
    $('#forage').disabled = !enoughPeople(1);
    $('#chop-wood').disabled = !enoughPeople(1);
    $('#hunt').disabled = !enoughPeople(2);
    $('#pray').disabled = isPraying;
};
const updateDate = () => {
    date.setDate(date.getDate() + 1);
    $('#days .value').innerText = `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
};
const projects = {
    fishing: {
        emoji: '🎣',
        done: false,
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
            population.fishers++;
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
        done: false,
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
            population.fishers++;
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
        done: false,
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
            renderProject('shipyard');
            renderProject('spinning_wheel');
        }
    },
    weapons: {
        emoji: '🛡',
        done: false,
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
        done: false,
        unlocked: true,
        description: 'Some foragers will start gathering fibers, spinning into thread, producing cloth. (-50% food from foraging)',
        cost: {
            wood: 10,
            food: 20,
            people: 2,
            days: 3,
        },
        callback: () => {
            log('Foragers have started producing cloth from fibers.', 'blue', '🧶', 'info');
            foragingReturns -= 1;
            $('#forage .return').innerText = foragingReturns;
            blink('foraging', 'blink');
            unlockCaravela();
        }
    },
    shipyard: {
        emoji: '⚓',
        done: false,
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
            unlockCaravela();
        }
    },
    caravela: {
        description: 'Build a caravela and return home. Requires a shipyard, carpentry, textiles, as well as food for the trip.',
        emoji: '🌊',
        done: false,
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
        callback: () => {
            log('The Caravela construction is complete! Shall we?', 'green', '🌊', 'info');
            show('#newShip');
            show('#leave');
        }
    },
    chapel: {
        description: 'A place where people can gather to support, encorage and service each other (no extra effect).',
        requires: ['carpentry'],
        emoji: '🙏',
        cost: {
            wood: 20,
            food: 20,
            people: 3,
            days: 3,
        },
        callback: () => {
            godSatisfaction += 0.5;
            show('#pray');
        }
    }
};
const unlockCaravela = () => {
    if (projects.spinning_wheel.done && projects.shipyard.done) {
        log('The caravela construction project is in sight!', 'green', '🌊', 'info');
        projects.caravela.unlocked = true;
    }
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
    if ($('.projects').classList.contains('closed')) {
        $('.projects').classList.remove('closed');
        return;
    }
    const project = projects[projectName];
    if (project.done) {
        return;
    }
    if (projectName === 'caravela' && !project.unlocked) {
        const missing = projects.caravela.requires
            .filter(r => !projects[r].done)
            .map(r => `[${r.replace(/_/g, ' ')}]`);
        if (missing.length > 0) {
            blink(projectName, 'no');
            const msg = `Construction of the new caravela requires ${missing.join(' and ')}.`;
            $('#requirements').innerText = msg;
            log(msg, null, '❌', 'info');
            return;
        }
    }
    const missing = ['wood', 'food'].filter(resource => resources[resource] < project.cost[resource]);
    if (missing.length > 0) {
        blink(projectName, 'no');
        const msg = `There is not enough ${missing.join(' and ')} to start the ${projectName} project`;
        $('#requirements').innerText = msg;
        log(msg, null, '❌', 'info');
        return;
    }
    if (!enoughPeople(project.cost.people)) {
        if (projectName === 'caravela') {
            const ready = population.ready - population.starving;
            const manHours = project.cost.people * project.cost.days;
            const duration = Math.ceil(manHours / ready);
            log(`The Caravela contruction started, but with only ${ready} people, it will take ${duration} days.`, null, '⚒', 'info');
            project.cost.people = ready;
            project.cost.days = duration;
        }
        else {
            const msg = `Not enough people ready to start the ${projectName} project`;
            $('#requirements').innerText = msg;
            log(msg, null, '❌', 'info');
            return;
        }
    }
    resources.wood -= project.cost.wood;
    resources.food -= project.cost.food;
    population.ready -= project.cost.people;
    project.done = true;
    const $project = $(`.project#${projectName}`);
    const duration = project.cost.days * DAY;
    $project.style.transition = `height ${duration}ms linear`;
    $project.classList.add('in-progress');
    $('.projects').classList.add('closed');
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
    $('#island').style.filter = 'brightness(.5) contrast(1.0) saturate(0)';
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
    log('People settled by the sea.', null, '⛺️', 'info');
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
        $('.projects').classList.toggle('closed');
        $('#requirements').innerText = null;
    });
};
on($('.intro button'), 'click', () => {
    updateDate();
    updateView();
    $('.intro').classList.add('closed');
    document.body.style.setProperty('--v', '1');
    setTimeout(startGame, 3000);
});
