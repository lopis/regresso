var $ = q => document.querySelector(q);
var $a = q => document.querySelectorAll(q);
var on = (elem, event, callback) => elem.addEventListener(event, callback);
var $$ = (tag, className, innerHTML) => {
    var el = document.createElement(tag);
    el.classList.add(className);
    el.innerHTML = innerHTML;
    return el;
};
var log = (text, color, emoji, type) => {
    if ($(`.log#${type} .new`)) {
        setTimeout(() => log(text, color, emoji, type), 500);
        return;
    }
    var newLog = $$('p', `${color}`, `<span class="icon">${emoji}</span><span class="${color}">${text}</span>`);
    newLog.classList.add('new');
    $(`.log#${type}`).prepend(newLog);
    if (color === 'restart') {
        on(newLog, 'click', restart);
    }
    setTimeout(() => {
        newLog.classList.remove('new');
    }, 200);
};
var show = (q) => {
    $(q).style.visibility = 'visible';
};
var display = (q) => {
    $(q).classList.remove('hidden');
};
var undisplay = (q) => {
    $(q).classList.add('hidden');
};
var hide = (q) => {
    $(q).style.visibility = 'hidden';
};
var openModal = (name) => {
    show(`#${name}`);
    $('body').classList.add('blured');
};
var closeModal = (name) => {
    $(`#${name}`).classList.add('closed');
    $('body').classList.remove('blured');
};
var shuffle = (array) => {
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
var timeout = (fn, dur) => {
    timeouts.push(setTimeout(fn, dur));
};
let intervals = [];
var interval = (fn, dur) => {
    intervals.push(setInterval(fn, dur));
};
var clearAllTimers = () => {
    timeouts.forEach(clearTimeout);
    timeouts = [];
    intervals.forEach(clearInterval);
    intervals = [];
    clearInterval(dayInterval);
    clearInterval(dayCycleInterval);
};
var resetGame = () => {
    clearAllTimers();
    document.body.style.setProperty('--v', '0');
    $a('.actions button').forEach(b => b.style.visibility = 'hidden');
    $a('.project').forEach(p => p.remove());
    $('#island').remove();
    $('#main-image').append(svgBackup.cloneNode(true));
    $a('.log').forEach(l => l.innerHTML = '');
    $('#island').style.filter = null;
    hide('#score-board');
    show('#ship');
    $('#ship').classList.remove('go');
    $('#ship').classList.remove('new');
    resetPeople();
    resetData();
};
var buffer = {
    foragers: 0,
    foraging: 0,
    hunters: 0,
    hunting: 0,
    loggers: 0,
    wood: 0,
};
var printScore = () => {
    var days = (date.getTime() - initialDate.getTime()) / (1000 * 60 * 60 * 24);
    var left = $('#leave').disabled;
    var completed = $a('.project.done').length;
    var score = [
        'Days taken', days,
        'Population saved', populationTotal,
        'Projects completed', completed,
        'Went back to the sea?', left ? 'Yes' : 'No',
    ];
    if (left) {
        score.push('Survived wrath of god?');
        score.push(godsWrath <= godsWrathThereshold ? 'Yes' : 'No');
    }
    var total = Math.ceil((populationTotal * 25 + completed * 7 + (left ? 10 : 0)) * (1 - godsWrath) * (30 / days));
    $('#score-board .modal .content').innerHTML = score.map(value => `<span>${value}</span>`).join('') + `<p>Final Score</p><p>${total} pts</p>`;
    openModal('score-board');
};
var bring = (action, partySize, amount, risk) => () => {
    buffer[action] += amount;
    initBuffer();
    var die = Math.random() < risk * attackChance;
    if (!die) {
        populationReady += partySize;
    }
    else {
        log(`Wild animals killed ${makeDeadPerson().name} while ${action == 'wood' ? 'logging' : action}`, 'red', '💀', 'info');
        populationReady += partySize - 1;
        populationTotal -= 1;
        blink('population', 'red');
    }
    if (!projects.weapons.unlocked && (die || action === 'hunting')) {
        projects.weapons.unlocked = true;
        log('Hunters found dangerous animals; you need extra protection', 'blue', '🛡', 'info');
        blink('projects', 'blink');
        renderProject('weapons');
    }
    if (!huntingEnabled && (resources.food + buffer.foraging) > 80) {
        show('#hunt');
        blink('hunt', 'blink');
        huntingEnabled = true;
        log('Animals were sighted far in the valleys, hunting may be possible.', 'blue', '🏹', 'info');
    }
    if (action === 'wood') {
        if (!projects.carpentry.unlocked && (resources.wood + buffer.wood) > 5) {
            projects.carpentry.unlocked = true;
            log('Develop carpentry to process wood more efficiently', 'blue', '🔨', 'info');
            renderProject('carpentry');
            blink('projects', 'blink');
        }
        if (!smokeEnabled) {
            $('animate').beginElement();
            smokeEnabled = true;
            log('The crew rejoices the arrival of wood for cooking and heating.', null, '🔥', 'info');
            dayEvents.push(() => {
                if (resources.wood > 0) {
                    resources.wood = Math.max(0, resources.wood - 2);
                    if (!projects.carpentry.done) {
                        blink('wood', 'red');
                    }
                }
            });
        }
    }
    updateView();
};
function restart() {
    resetGame();
    init();
}
var handlers = {
    leave: () => {
        log(`${populationTotal} people board the caravela and get ready for departure`, null, '⛵️', 'info');
        $('#ship').classList.add('go');
        $('#leave').disabled = true;
        hide('#fishTrail');
        hide('#boatTrail');
        populationReady = 0;
        updateView();
        clearAllTimers();
        if (godsWrath > 0.2) {
            timeout(() => {
                log('A violent storm suddenly formed. The ship sank and there were no survivors.', null, '⛈', 'info');
                populationTotal = 0;
                updateView();
                stopGame();
                timeout(printScore, 5000);
            }, 7000);
        }
        else {
            timeout(() => {
                log('The journey back was long, but the weather was perfect.', null, '🌤', 'info');
                log('Fim.', null, '🌅', 'info');
                timeout(printScore, 5000);
            }, 7000);
        }
    },
    fetchWood: () => {
        var people = 1;
        populationReady -= people;
        var time = DAY * 0.6;
        timeout(bring('wood', people, 3, 0.03), time);
        buffer.loggers++;
        initBuffer();
        updateView();
        startTrail(time, 'ft', true);
    },
    pray: () => {
        populationReady -= 1;
        isPraying = true;
        timeout(() => {
            populationReady += 1;
            isPraying = false;
            godsWrath = godsWrath * 0.7;
            var person = getRandomPerson();
            log(`${person.name} is feeling envigorated after a day at the house of God. Praise the Lord!`, null, '✝️', 'info');
        }, DAY);
    },
    forage: () => {
        var people = 1;
        populationReady -= people;
        var time = DAY * 0.4;
        timeout(bring('foraging', people, foragingReturns, 0), time);
        buffer.foragers++;
        initBuffer();
        updateView();
        startTrail(time, 'ft', true);
    },
    hunt: () => {
        var people = 2;
        populationReady -= people;
        var time = DAY * 1.2;
        timeout(bring('hunting', people, 20, 0.1), time);
        buffer.hunters += people;
        initBuffer();
        updateView();
        startTrail(time, 'huntTrail', true);
    },
    restart: () => {
        if (confirm('Restart current game?')) {
            restart();
        }
    }
};
var setupClickHandlers = () => {
    $a('.actions button').forEach(b => {
        on(b, 'click', handlers[b.id]);
    });
    on($('#projects'), 'click', () => {
        $projects.classList.toggle('closed');
        $('#requirements').innerText = null;
    });
    on($('#score-board button'), 'click', restart);
    on($('.dismiss'), 'click', () => {
        closeModal('score-board');
    });
};
var mapping = {
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
var logTask = (value) => {
    if (buffer[value] < 1)
        return;
    log(`+${buffer[value]}`, 'green', mapping[value].e, 'tasks');
    resources[mapping[value].r] += buffer[value];
    buffer[value] = 0;
    blink(mapping[value].r, 'green');
};
var initBuffer = () => {
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
var blink = (resource, name) => {
    $(`#${resource}`).classList.add(name);
    timeout(() => {
        $(`#${resource}`).classList.remove(name);
    }, name === 'no' ? 400 : 100);
};
var updateFood = () => {
    let diff = resources.food - populationTotal;
    blink('food', 'red');
    if (diff >= 0) {
        populationHungry = populationStarving;
        populationStarving = 0;
        resources.food = diff;
    }
    else {
        var dead = Math.min(populationStarving, -diff);
        if (dead > 0) {
            log(`${getPeopleString(makePeopleDead(dead).map(p => p.name))} died from starvation.`, 'red', '💀', 'info');
            populationTotal -= dead;
            populationReady -= dead;
            populationStarving = 0;
            blink('population', 'red');
        }
        var starving = Math.min(populationHungry, -diff);
        populationHungry = Math.min(populationTotal - starving, -diff);
        if (starving > 0) {
            populationStarving = starving;
            log(`${starving} are starving and can't work.`, 'red', '😔', 'info');
        }
        else if (populationHungry > 0) {
            log(`${getRandomPerson().name} ${populationHungry > 2 ? `and ${populationHungry - 1} others are` : 'is'} getting hungry`, null, '💭', 'info');
        }
        resources.food = 0;
    }
};
var enoughPeople = (min) => {
    return (populationReady - populationStarving) >= min;
};
var nextDay = () => {
    updateDate();
    updateFood();
    if ((populationTotal) < 1) {
        log(`Your population was decimated. <strong>Restart?<strong>`, 'restart', '☠️', 'info');
        stopGame();
        updateView();
        return;
    }
    dayEvents.forEach(event => event());
    updateView();
};
var dayCycle = () => {
    $('#island').classList.toggle('night');
};
var initialDate = new Date('1549/08/13');
let svgBackup;
let initialFood = 0;
let initialWrath = 1.0;
let godsWrathThereshold = 0.2;
let resources;
let populationTotal;
let populationReady;
let populationHungry;
let populationStarving;
let populationFishers;
let foragingReturns;
let huntingEnabled;
let smokeEnabled;
let attackChance;
let bufferTimeout;
let bufferInterval;
let godsWrath;
let isPraying;
let dayEvents;
let DAY;
let date = new Date(initialDate);
var resetData = () => {
    resources = {
        wood: 0,
        food: initialFood,
    };
    populationTotal = 15;
    populationReady = 15;
    populationHungry = 0;
    populationStarving = 0;
    populationFishers = 0;
    foragingReturns = 2;
    huntingEnabled = false;
    smokeEnabled = false;
    attackChance = 1.0;
    bufferTimeout = 400;
    bufferInterval = null;
    godsWrath = 1.0;
    isPraying = false;
    dayEvents = [];
    DAY = 10000;
    date = new Date(initialDate);
    svgBackup = $('#island').cloneNode(true);
};
var people = shuffle([
    ['Abraão', '👨🏻‍🦱'],
    ['Simão', '👨🏼‍🦱'],
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
    var $person = $$('div', 'icon', el[1]);
    $person.id = el[0];
    $person.title = el[0];
    $('.ppl').append($person);
    rest.push({ name: el[0], alive: true });
    return rest;
}, []);
var resetPeople = () => {
    people.map(p => {
        p.alive = true;
        $(`#${p.name}`).classList.remove('dead');
    });
};
var getRandomPerson = () => {
    var alive = people.filter(p => p.alive);
    return alive[Math.round(Math.random() * (alive.length - 1))];
};
var makeDeadPerson = () => {
    var person = getRandomPerson();
    person.alive = false;
    $(`#${person.name}`).classList.add('dead');
    return person;
};
var makePeopleDead = (n) => {
    var p = [];
    for (let i = 0; i < n; i++) {
        p.push(makeDeadPerson());
    }
    return p;
};
var getPeopleString = (list) => {
    if (list.length < 2) {
        return list[0];
    }
    var str = list.join(', ');
    var lastComma = str.lastIndexOf(',');
    return str.substr(0, lastComma) + ' and' + str.substr(lastComma + 1);
};
let trailCount = 0;
var startTrail = (time, trailId, clone) => {
    var $trail = $(`#${trailId}`);
    var $newTrail = clone ? $trail.cloneNode() : $trail;
    let id = trailId;
    if (clone) {
        id = 'trail' + (++trailCount);
        $newTrail.id = id;
        $trail.after($newTrail);
    }
    setTimeout(() => {
        var pathLength = Math.round($trail.getTotalLength());
        if (trailId == 'huntTrail') {
            $newTrail.style.strokeDasharray = `0,${pathLength}px,0.5,1,0.5,1,0.5,1,0.5,100%`;
        }
        else {
            if (trailId == 'ft') {
                $newTrail.style.transform = `scaleX(${1 + Math.random() * 0.7 - 0.2})`;
            }
            $newTrail.style.strokeDasharray = `0,${pathLength}px,${trailId == 'boatTrail' ? 2 : 1}`;
        }
    }, 100);
    setTimeout(() => {
        $newTrail.style.strokeDasharray = null;
    }, time / 2);
    if (clone) {
        timeout(() => {
            $newTrail && $newTrail.remove();
        }, time);
    }
};
var updateView = () => {
    $('#wood .value').innerText = resources.wood;
    $('#food .value').innerText = resources.food;
    $('#population .value').innerText = populationTotal;
    $('#ready .value').innerText = Math.max(0, populationReady - populationStarving);
    $('#starving .value').innerText = populationStarving;
    if (populationStarving < 1) {
        undisplay('#starving');
    }
    else {
        display('#starving');
    }
    $('#fishers .value').innerText = populationFishers;
    if (populationFishers > 1) {
        display('#fishers');
    }
    $('#forage').disabled = !enoughPeople(1);
    $('#fetchWood').disabled = !enoughPeople(1);
    $('#hunt').disabled = !enoughPeople(2);
    $('#pray').disabled = !enoughPeople(1) || isPraying;
};
var updateDate = () => {
    date.setDate(date.getDate() + 1);
    $('#days .value').innerText = `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
};
var sinkBoatAnimation = () => {
    var $shipTop = $('#ss');
    $shipTop.removeAttribute('transform');
    $('#sail').beginElement();
    $('#sink').beginElement();
    var time = Date.now();
    setTimeout(() => {
        console.log('end', Date.now() - time);
        hide('#ship');
        $shipTop.transform.baseVal.appendItem($shipTop.transform.baseVal.createSVGTransformFromMatrix($('#island').createSVGMatrix()));
        $shipTop.transform.baseVal.appendItem($shipTop.transform.baseVal.createSVGTransformFromMatrix($('#island').createSVGMatrix()));
        $shipTop.transform.baseVal.getItem(1).setScale(-1, 1);
        $shipTop.transform.baseVal.getItem(0).setTranslate(-20, 0);
    }, $('#sink').getSimpleDuration() * 990);
};
var $projects = $('.projects');
let projects;
var initProjects = () => {
    projects = {
        fishing: {
            emoji: '🎣',
            done: false,
            unlocked: true,
            cost: {
                wood: 10,
                food: 10,
                ppl: 4,
                days: 2,
            },
            description: 'Develop fishing tools (+3🍒/day, -1 ready 👤)',
            callback: () => {
                log('Fishing preparations have been developed (+3 food per day).', 'blue', '🎣', 'info');
                show('#fh');
                populationReady -= 1;
                populationFishers++;
                interval(() => {
                    startTrail(DAY / 3, 'fishTrail', false);
                }, DAY / 3);
                dayEvents.push(() => {
                    resources.food += 3;
                    log(`+3🍒`, 'blue', '🐟', 'tasks');
                });
            }
        },
        high_sea_fishing: {
            emoji: '🚣‍',
            done: false,
            unlocked: true,
            requires: [
                'shipyard',
                'fishing'
            ],
            cost: {
                wood: 25,
                food: 10,
                ppl: 5,
                days: 5
            },
            description: 'Build a fishing boat (+5🍒/day, -1 ready 👤).',
            callback: () => {
                populationReady -= 1;
                populationFishers++;
                show('#boatTrail');
                interval(() => {
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
                ppl: 4,
                days: 2,
            },
            description: 'Recycle wood and build better buildings (+5 wood per day)',
            callback: () => {
                log('Carpentry was perfected, new buildings are now available.', 'blue', '🔨', 'info');
                blink('projects', 'blink');
                renderProject('shipyard');
                renderProject('spinning_wheel');
                renderProject('chapel');
                dayEvents.push(() => {
                    resources.wood += 5;
                    blink('wood', 'green');
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
                ppl: 4,
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
                ppl: 2,
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
                ppl: 5,
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
            emoji: '⛵️',
            done: false,
            unlocked: false,
            requires: [
                'shipyard',
                'spinning_wheel',
            ],
            cost: {
                wood: 100,
                food: 200,
                ppl: 10,
                days: 8,
            },
            callback: () => {
                log('The Caravela construction is complete! Shall we?', 'green', '🌊', 'info');
                show('#ship');
                $('#ship').classList.add('new');
                $('#leave').disabled = false;
                show('#leave');
            }
        },
        chapel: {
            description: 'A place where people can gather to support, encorage and service each other.',
            requires: ['carpentry'],
            emoji: '🙏',
            cost: {
                wood: 20,
                food: 20,
                ppl: 3,
                days: 3,
            },
            callback: () => {
                godsWrath -= 0.5;
                show('#pray');
                show('#cp');
            }
        }
    };
};
var unlockCaravela = () => {
    if (projects.spinning_wheel.done && projects.shipyard.done) {
        log('The caravela construction project is in sight!', 'green', '🌊', 'info');
        projects.caravela.unlocked = true;
    }
};
var renderProject = (key) => {
    var project = projects[key];
    var $newProject = $$('div', 'project', null);
    let icon = project.emoji;
    if (key === 'caravela') {
        icon = `<svg height="50px" viewBox="0 0 50 50" width="50px">${$('#ss').outerHTML.replace('"ss"', '')}</svg>`;
    }
    $newProject.id = key;
    $newProject.innerHTML =
        `<div class="icon">${icon}</div>
<div class="title caps">${key.replace(/_/g, ' ')}</div>
<small class="description">${project.description}</small>
<div class="cost">
  ${project.cost.wood} 🌳  ${project.cost.food} 🍒  ${project.cost.ppl} 👥  ${project.cost.days} days ⏳
</div>`;
    $projects.append($newProject);
    on($newProject, 'click', selectProject(key));
};
var selectProject = (projectName) => () => {
    if ($projects.classList.contains('closed')) {
        $projects.classList.remove('closed');
        return;
    }
    var project = projects[projectName];
    if (project.done) {
        return;
    }
    if (projectName === 'caravela' && !project.unlocked) {
        var missing = projects.caravela.requires
            .filter(r => !projects[r].done)
            .map(r => `[${r.replace(/_/g, ' ')}]`);
        if (missing.length > 0) {
            blink(projectName, 'no');
            var msg = `Construction of the new caravela requires ${missing.join(' and ')}.`;
            $('#requirements').innerText = msg;
            log(msg, null, '❌', 'info');
            return;
        }
    }
    missing = ['wood', 'food'].filter(resource => resources[resource] < project.cost[resource]);
    if (missing.length > 0) {
        blink(projectName, 'no');
        var msg = `There is not enough ${missing.join(' and ')} to start the ${projectName} project`;
        $('#requirements').innerText = msg;
        log(msg, null, '❌', 'info');
        return;
    }
    if (!enoughPeople(project.cost.ppl)) {
        if (projectName === 'caravela') {
            var ready = populationReady - populationStarving;
            var manHours = project.cost.ppl * project.cost.days;
            var duration = Math.ceil(manHours / ready);
            log(`The Caravela contruction started, but with only ${ready} people, it will take ${duration} days.`, null, '⚒', 'info');
            project.cost.ppl = ready;
            project.cost.days = duration;
        }
        else {
            var msg = `Not enough people ready to start the ${projectName} project`;
            $('#requirements').innerText = msg;
            log(msg, null, '❌', 'info');
            return;
        }
    }
    resources.wood -= project.cost.wood;
    resources.food -= project.cost.food;
    populationReady -= project.cost.ppl;
    project.done = true;
    var $project = $(`.project#${projectName}`);
    var duration = project.cost.days * DAY;
    $project.style.transition = `height ${duration}ms linear`;
    $project.classList.add('in-progress');
    $projects.classList.add('closed');
    timeout(() => {
        $project.classList.add('done');
        $project.classList.remove('in-progress');
        $project.style.transition = null;
        populationReady += project.cost.ppl;
        project.callback();
    }, duration);
};
let dayInterval, dayCycleInterval;
var stopDays = () => {
    clearInterval(dayInterval);
    clearInterval(dayCycleInterval);
};
var stopGame = () => {
    stopDays();
    $('#island').style.filter = 'brightness(.5) contrast(1.0) saturate(0)';
};
var resumeGame = () => {
    dayInterval = setInterval(nextDay, DAY);
    dayCycleInterval = setInterval(dayCycle, DAY / 2);
};
var init = () => {
    resetData();
    updateDate();
    updateView();
    closeModal('intro');
    sinkBoatAnimation();
    setTimeout(() => {
        document.body.style.setProperty('--v', '1');
    }, 4000);
    timeout(startGame, 4000);
};
var startGame = () => {
    resetData();
    initProjects();
    updateDate();
    updateView();
    resumeGame();
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
on($('#intro button'), 'click', () => {
    setupClickHandlers();
    init();
});
if (document.monetization && document.monetization.state === 'started') {
    display('#coil');
    godsWrathThereshold = 0.3;
    initialFood = 30;
}
