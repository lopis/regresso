const $ = q => document.querySelector(q);
const $a = q => document.querySelectorAll(q);
const on = (elem, event, callback) => elem.addEventListener(event, callback);
const $$ = (tag, className, innerHTML) => {
    const el = document.createElement(tag);
    el.classList.add(className);
    el.innerHTML = innerHTML;
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
    if (color === 'restart') {
        on(newLog, 'click', restart);
    }
    setTimeout(() => {
        newLog.classList.remove('new');
    }, 200);
};
const show = (q) => {
    $(q).style.visibility = 'visible';
};
const hide = (q) => {
    $(q).style.visibility = 'hidden';
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
let timeouts = [];
const timeout = (fn, dur) => {
    timeouts.push(setTimeout(fn, dur));
};
let intervals = [];
const interval = (fn, dur) => {
    intervals.push(setInterval(fn, dur));
};
const clearAllTimers = () => {
    timeouts.forEach(clearTimeout);
    timeouts = [];
    intervals.forEach(clearInterval);
    intervals = [];
    clearInterval(dayInterval);
    clearInterval(dayCycleInterval);
};
const resetGame = () => {
    clearAllTimers();
    document.body.style.setProperty('--v', '0');
    $a('button').forEach(b => b.style.visibility = 'hidden');
    $a('.project').forEach(p => p.remove());
    $('#island').innerHTML = svgBackup;
    $a('.log').forEach(l => l.innerHTML = '');
    $('#island').style.filter = null;
    hide('#score-board');
    resetPeople();
    for (const key in initCon) {
        if (initCon[key] instanceof Object) {
            Object.assign(window[key], initCon[key]);
        }
        else {
            window[key] = initCon[key];
        }
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
const printScore = () => {
    const days = (date.getTime() - initCon.date.getTime()) / (1000 * 60 * 60 * 24);
    const left = $('#leave').disabled;
    const completed = $a('.project.done').length;
    const score = [
        'Days taken', days,
        'Population saved', p.total,
        'Projects completed', completed,
        'Went back to the sea', left ? 'Yes' : 'No',
    ];
    if (left) {
        score.push('Survived wrath of god');
        score.push(godsWrath <= 0.2 ? 'Yes' : 'No');
    }
    const total = Math.ceil((p.total * 10 + completed - days + (left ? 10 : 0)) * (1 - godsWrath));
    $('#score-board .modal .content').innerHTML = score.map(value => `<span>${value}</span>`).join('') + `<p>Final Score</p><p>${total} pts</p>`;
    show('#score-board');
};
const bring = (action, partySize, amount, risk) => () => {
    buffer[action] += amount;
    initBuffer();
    const die = Math.random() < risk * attackChance;
    if (!die) {
        p.ready += partySize;
    }
    else {
        log(`Wild animals killed ${makeDeadPerson().name} while ${action == 'wood' ? 'logging' : action}`, 'red', '💀', 'info');
        p.ready += partySize - 1;
        p.total -= 1;
        blink('population', 'red');
    }
    if (!projects.weapons.unlocked && (die || action === 'hunting')) {
        projects.weapons.unlocked = true;
        log('Hunters found dangerous animals; they could use some extra protection', 'blue', '🛡', 'info');
        blink('projects', 'blink');
        renderProject('weapons');
    }
    if (action === 'foraging' && r.food > 80 && !huntingEnabled) {
        show('#hunt');
        blink('hunt', 'blink');
        huntingEnabled = true;
        log('Animals were sighted far in the valleys, hunting may be possible.', 'blue', '🏹', 'info');
    }
    if (action === 'wood' && !projects.carpentry.unlocked && r.wood > 5) {
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
            if (r.wood > 0) {
                r.wood = Math.max(0, r.wood - 2);
                blink('wood', 'red');
            }
        });
    }
    updateView();
};
function restart() {
    resetGame();
    init();
}
const handlers = {
    leave: () => {
        log(`${p.total} people board the caravela and get ready for departure`, null, '⛵️', 'info');
        $('#newShip').classList.add('go');
        p.ready = 0;
        updateView();
        clearAllTimers();
        if (godsWrath > 0.2) {
            timeout(() => {
                log('A violent storm suddenly forms. The ship capsizes and sinks. There are no survivors.', null, '⛈', 'info');
                p.total = 0;
                updateView();
                stopGame();
                printScore();
            }, 7000);
        }
        else {
            timeout(() => {
                log('The journey back was long. They experienced perfect weather and ideal winds.', null, '🌤', 'info');
                log('Fim.', null, '🌅', 'info');
            }, 7000);
        }
    },
    fetchWood: () => {
        const people = 1;
        p.ready -= people;
        const time = DAY * 0.6;
        timeout(bring('wood', people, 3, 0.05), time);
        buffer.loggers++;
        initBuffer();
        updateView();
        startTrail(time, 'forageTemplate', true);
    },
    pray: () => {
        p.ready -= 1;
        isPraying = true;
        timeout(() => {
            p.ready += 1;
            isPraying = false;
            godsWrath = godsWrath * 0.7;
            const person = getRandomPerson();
            log(`${person.name} is feeling envigorated after a day at the house of God. Praise the Lord!`, null, '✝️', 'info');
        }, DAY);
    },
    forage: () => {
        const people = 1;
        p.ready -= people;
        const time = DAY * 0.4;
        timeout(bring('foraging', people, foragingReturns, 0), time);
        buffer.foragers++;
        initBuffer();
        updateView();
        startTrail(time, 'forageTemplate', true);
    },
    hunt: () => {
        const people = 2;
        p.ready -= people;
        const time = DAY * 1.2;
        timeout(bring('hunting', people, 20, 0.1), time);
        buffer.hunters += people;
        initBuffer();
        updateView();
        startTrail(time, 'huntTrail', true);
    },
    restart: restart
};
const setupClickHandlers = () => {
    $a('.actions button').forEach(b => {
        on(b, 'click', handlers[b.id]);
    });
    on($('#projects'), 'click', () => {
        $('.projects').classList.toggle('closed');
        $('#requirements').innerText = null;
    });
    on($('#score-board button'), 'click', restart);
};
const mapping = {
    wood: {
        r: 'wood', e: '🌳'
    },
    foraging: {
        r: 'food', e: '🌾'
    },
    hunting: {
        r: 'food', e: '🏹'
    }
};
const logTask = (value) => {
    if (buffer[value] < 1)
        return;
    log(`+${buffer[value]}`, 'green', mapping[value].e, 'tasks');
    r[mapping[value].r] += buffer[value];
    buffer[value] = 0;
    blink(mapping[value].r, 'green');
};
const initBuffer = () => {
    clearInterval(bufferInterval);
    bufferInterval = setInterval(() => {
        ['foraging', 'hunting', 'wood'].forEach(logTask);
        if (buffer.foragers) {
            log(`${buffer.foragers}👤 went foraging.`, null, '🌾', 'tasks');
            buffer.foragers = 0;
        }
        if (buffer.hunters) {
            log(`${buffer.hunters}👥 went hunting .`, null, '🏹', 'tasks');
            buffer.hunters = 0;
        }
        if (buffer.loggers) {
            log(`${buffer.loggers}👤 went logging.`, null, '🌳', 'tasks');
            buffer.loggers = 0;
        }
        updateView();
    }, bufferTimeout);
};
const blink = (resource, name) => {
    $(`#${resource}`).classList.add(name);
    timeout(() => {
        $(`#${resource}`).classList.remove(name);
    }, name === 'no' ? 400 : 100);
};
const updateFood = () => {
    let diff = r.food - p.total;
    blink('food', 'red');
    if (diff >= 0) {
        p.hungry = p.starving;
        p.starving = 0;
        r.food = diff;
    }
    else {
        const dead = Math.min(p.starving, -diff);
        if (dead > 0) {
            log(`${makePeopleDead(dead).map(p => p.name).join(', ')} died from starvation.`, 'red', '💀', 'info');
            p.total -= dead;
            p.ready -= dead;
            p.starving = 0;
            blink('population', 'red');
        }
        const starving = Math.min(p.hungry, -diff);
        p.hungry = Math.min(p.total - starving, -diff);
        if (starving > 0) {
            p.starving = starving;
            log(`${starving} are starving and can't work.`, 'red', '😔', 'info');
        }
        else if (p.hungry > 0) {
            log(`${getRandomPerson().name} ${p.hungry > 2 ? `and ${p.hungry - 1} others are` : 'is'} getting hungry`, null, '💭', 'info');
        }
        r.food = 0;
    }
};
const enoughPeople = (min) => {
    return (p.ready - p.starving) >= min;
};
const nextDay = () => {
    updateDate();
    updateFood();
    if ((p.total) < 1) {
        log(`Your population was decimated. <strong>Restart?<strong>`, 'restart', '☠️', 'info');
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
var r = {
    wood: 0,
    food: 0,
};
var p = {
    total: 15,
    ready: 15,
    hungry: 0,
    starving: 0,
    fishers: 0
};
var foragingReturns = 2;
var huntingEnabled = false;
var smokeEnabled = false;
var attackChance = 1.0;
var bufferTimeout = 400;
var bufferInterval = null;
var godsWrath = 1;
var isPraying = false;
var dayEvents = [];
var DAY = 10000;
var date = new Date('1549/08/13');
const initCon = {
    r: Object.assign({}, r),
    p: Object.assign({}, p),
    foragingReturns,
    huntingEnabled,
    smokeEnabled,
    attackChance,
    bufferTimeout,
    bufferInterval,
    godsWrath,
    isPraying,
    date: new Date(date),
    dayEvents,
};
const svgBackup = $('#island').innerHTML;
const people = shuffle([
    ['Abraão', '👨🏻‍🦱'],
    ['Bartolomeu', '👨🏼‍🦱'],
    ['João', '👨🏻'],
    ['Jacinto', '🧔🏽'],
    ['Paulo', '👴🏼'],
    ['Tiago', '👦🏻'],
    ['Isaías', '🧑🏻'],
    ['Henrique', '👨🏼‍🦰'],
    ['Tomás', '🧓🏼'],
    ['Amélia', '👩🏼‍🦳'],
    ['Camila', '👩🏾‍🦱'],
    ['Benedita', '👩🏻‍🦱'],
    ['Madalena', '👩🏻'],
    ['Teresa', '👩🏼'],
    ['Lúcia', '👩🏼‍🦰'],
]).reduce((rest, el) => {
    const $person = $$('div', 'icon', el[1]);
    $person.id = el[0];
    $person.title = el[0];
    $('.people').append($person);
    rest.push({ name: el[0], alive: true });
    return rest;
}, []);
const resetPeople = () => {
    people.map(p => {
        p.alive = true;
        $(`#${p.name}`).classList.remove('dead');
    });
};
let deadPeople = 0;
const getRandomPerson = () => {
    const alive = people.filter(p => p.alive);
    return alive[Math.round(Math.random() * (alive.length - 1))];
};
const makeDeadPerson = () => {
    deadPeople++;
    const person = getRandomPerson();
    person.alive = false;
    $(`#${person.name}`).classList.add('dead');
    return person;
};
const makePeopleDead = (n) => {
    const p = [];
    for (let i = 0; i < n; i++) {
        p.push(makeDeadPerson());
    }
    return p;
};
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
const updateView = () => {
    $('#wood .value').innerText = r.wood;
    $('#food .value').innerText = r.food;
    $('#population .value').innerText = p.total;
    $('#ready .value').innerText = Math.max(0, p.ready - p.starving);
    $('#starving .value').innerText = p.starving;
    if (p.starving < 1) {
        $('#starving').classList.add('hidden');
    }
    else {
        $('#starving').classList.remove('hidden');
    }
    $('#fishers .value').innerText = p.fishers;
    if (p.fishers < 1) {
        $('#fishers').classList.add('hidden');
    }
    else {
        $('#fishers').classList.remove('hidden');
    }
    $('#forage').disabled = !enoughPeople(1);
    $('#fetchWood').disabled = !enoughPeople(1);
    $('#hunt').disabled = !enoughPeople(2);
    $('#pray').disabled = !enoughPeople(1) || isPraying;
};
const updateDate = () => {
    date.setDate(date.getDate() + 1);
    $('#days .value').innerText = `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
};
const sinkBoatAnimation = () => {
    $('#sail').beginElement();
    $('#sink').beginElement();
    $('#sinkRotate').beginElement();
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
            p.ready -= 1;
            p.fishers++;
            interval(() => {
                startTrail(DAY / 3, 'fishTrail', false);
            }, DAY / 3);
            dayEvents.push(() => {
                r.food += 3;
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
            p.ready -= 1;
            p.fishers++;
            show('#boatTrail');
            interval(() => {
                startTrail(DAY / 2, 'boatTrail', false);
            }, DAY / 2);
            dayEvents.push(() => {
                r.food += 5;
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
        description: 'Recycle and process wood more efficiently (+5 wood per day)',
        callback: () => {
            log('Carpentry was perfected, new buildings are now available.', 'blue', '🔨', 'info');
            blink('projects', 'blink');
            renderProject('shipyard');
            renderProject('spinning_wheel');
            renderProject('chapel');
            dayEvents.push(() => {
                r.wood += 5;
                log(`+5🌳`, 'blue', '🔨', 'tasks');
            });
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
            godsWrath -= 0.5;
            show('#pray');
            show('#cp');
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
  <div class="title caps">${key.replace(/_/g, ' ')}</div>
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
    const missing = ['wood', 'food'].filter(resource => r[resource] < project.cost[resource]);
    if (missing.length > 0) {
        blink(projectName, 'no');
        const msg = `There is not enough ${missing.join(' and ')} to start the ${projectName} project`;
        $('#requirements').innerText = msg;
        log(msg, null, '❌', 'info');
        return;
    }
    if (!enoughPeople(project.cost.people)) {
        if (projectName === 'caravela') {
            const ready = p.ready - p.starving;
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
    r.wood -= project.cost.wood;
    r.food -= project.cost.food;
    p.ready -= project.cost.people;
    project.done = true;
    const $project = $(`.project#${projectName}`);
    const duration = project.cost.days * DAY;
    $project.style.transition = `height ${duration}ms linear`;
    $project.classList.add('in-progress');
    $('.projects').classList.add('closed');
    timeout(() => {
        $project.classList.add('done');
        $project.classList.remove('in-progress');
        $project.style.transition = null;
        p.ready += project.cost.people;
        project.callback();
        updateProjects();
    }, duration);
};
let dayInterval, dayCycleInterval;
const stopDays = () => {
    clearInterval(dayInterval);
    clearInterval(dayCycleInterval);
};
const stopGame = () => {
    stopDays();
    $('#island').style.filter = 'brightness(.5) contrast(1.0) saturate(0)';
};
const resumeGame = () => {
    dayInterval = setInterval(nextDay, DAY);
    dayCycleInterval = setInterval(dayCycle, DAY / 2);
    $('#days').classList.remove('paused');
};
const init = () => {
    updateDate();
    updateView();
    $('.intro').classList.add('closed');
    sinkBoatAnimation();
    setTimeout(() => {
        document.body.style.setProperty('--v', '1');
    }, 4000);
    timeout(startGame, 4000);
};
const startGame = () => {
    resumeGame();
    updateDate();
    updateView();
    renderProject('caravela');
    initBuffer();
    log('People settled by the sea.', null, '⛺️', 'info');
    timeout(() => {
        log(`${getRandomPerson().name} found good foraging grounds nearby.`, 'blue', '🌾', 'info');
        show('#forage');
        show('#restart');
        blink('forage', 'blink');
    }, 2000);
    timeout(() => {
        log(`${getRandomPerson().name} made some rudimentary axes for logging`, 'blue', '🌳', 'info');
        show('#fetchWood');
        blink('fetchWood', 'blink');
    }, DAY);
    timeout(() => {
        log('The river can provide you food if you develop fishing.', 'blue', '🐟', 'info');
        blink('projects', 'blink');
        renderProject('fishing');
    }, DAY * 2);
};
on($('.intro button'), 'click', () => {
    setupClickHandlers();
    init();
});
