var $ = function (q) { return document.querySelector(q); };
var on = function (elem, event, callback) { return elem.addEventListener(event, callback); };
var $$ = function (tag, className, innerText) {
    var el = document.createElement(tag);
    el.classList.add(className);
    el.innerText = innerText;
    return el;
};
var log = function (text, color, emoji) {
    if ($('#log .new')) {
        setTimeout(function () { return log(text, color, emoji); }, 500);
        return;
    }
    var newLog = document.createElement('p');
    newLog.innerHTML = "<span class=\"icon\">" + emoji + "</span><span class=\"" + color + "\">" + text + "</span>";
    if (color)
        newLog.classList.add(color);
    newLog.classList.add('new');
    $('#log').prepend(newLog);
    setTimeout(function () {
        newLog.classList.remove('new');
    }, 200);
};
on($('#chop-wood'), 'click', function () { return fetchWood(); });
on($('#forage'), 'click', function () { return forage(); });
on($('#hunt'), 'click', function () { return hunt(); });
var fetchWood = function () {
    population.ready -= 2;
    setTimeout(bring('wood', 2, 5, 0.05), DAY * 0.5);
    log('2 people set off to bring wood.', null, '🌳');
    updateView();
};
var forage = function () {
    population.ready -= 2;
    setTimeout(bring('food', 2, 4, 0), DAY * 0.3);
    log('2 people have gone foraging.', null, '🌾');
    updateView();
};
var hunt = function () {
    population.ready -= 4;
    var time = DAY * 1.2;
    setTimeout(bring('food', 4, 12, 0.1), time);
    log('4 hunters left to bring food.', null, '🏹');
    updateView();
    startTrail(time);
};
var bring = function (resource, partySize, amount, risk) { return function () {
    if (Math.random() > risk) {
        log("A party of " + partySize + " has returned with " + amount + " " + resource + " successfully.", 'green', '🌟');
        resources[resource] += amount;
        population.ready += partySize;
    }
    else {
        log("A party of " + partySize + " returned from fetching " + resource + ", but got attacked by wild animals. 1 person died", 'red', '💀');
        resources[resource] += Math.floor(amount / 2);
        population.ready += partySize - 1;
        blink('population', 'red');
    }
    updateView();
    blink(resource, 'green');
}; };
var blink = function (resource, color) {
    $("#" + resource).classList.add(color);
    setTimeout(function () {
        $("#" + resource).classList.remove(color);
    }, 100);
};
var updateView = function () {
    $('#wood .value').innerText = resources.wood;
    $('#food .value').innerText = resources.food;
    $('#population .value').innerText = population.total;
    $('#ready .value').innerText = population.ready;
    $('#hungry .value').innerText = population.hungry;
    if (population.hungry < 1) {
        $('#hungry').classList.add('hidden');
    }
    else {
        $('#hungry').classList.remove('hidden');
    }
    $('#forage').disabled = population.ready < 2;
    $('#chop-wood').disabled = population.ready < 2;
    $('#hunt').disabled = population.ready < 4;
};
var updateDate = function () {
    date.setDate(date.getDate() + 1);
    $('#days .value').innerText = date.getDate() + " / " + (date.getMonth() + 1) + " / " + date.getFullYear();
};
var nextDay = function () {
    updateDate();
    if ((population.ready + population.hungry) < 1) {
        log("Your population was decimated", 'red', '☠️');
        stopGame();
    }
    if (population.hungry > 0) {
        population.hungry -= 1;
        population.total -= 1;
        log("One person has died from starvation. +5 food.", 'red', '💀');
        resources.food += 5;
        blink('food', 'green');
        blink('population', 'red');
        bury();
    }
    population.ready += population.hungry;
    population.hungry = 0;
    resources.food -= population.ready;
    if (resources.food < 0) {
        population.ready += resources.food;
        population.hungry += -resources.food;
        resources.food = 0;
        log("Due to lack of food, " + population.hungry + " are starving and can't work.", 'red', '😔');
    }
    updateView();
};
var dayCycle = function () {
    $('svg').classList.toggle('night');
};
var resources = {
    wood: 3,
    food: 35
};
var population = {
    total: 15,
    ready: 15,
    hungry: 0,
    sick: 0,
    hurt: 0
};
var DAY = 10000;
var date = new Date('1499/05/13');
var trailCount = 0;
var startTrail = function (time) {
    var newTrail = $('#trailTemplate').cloneNode();
    var id = 'trail' + (++trailCount);
    newTrail.id = id;
    $('#trailTemplate').after(newTrail);
    setTimeout(function () {
        newTrail.style.strokeDasharray = '0,100%,1,100%';
    }, 100);
    setTimeout(function () {
        $("#" + id).style.strokeDasharray = null;
    }, time / 2);
    setTimeout(function () {
        $("#" + id).remove();
    }, time);
};
var bury = function () {
    var index = $('#crosses').children.length - population.total + 1;
    if ($('#crosses').children[index]) {
        $('#crosses').children[index].style.display = 'initial';
    }
};
var projects = {
    carpentry: {
        emoji: '🔨',
        cost: {
            wood: 10,
            food: 10,
            people: 4
        },
        description: 'Recycle and process wood more efficiently (+1 wood per day)'
    },
    fishing: {
        emoji: '🎣',
        cost: {
            wood: 10,
            food: 10,
            people: 4,
            days: 2
        },
        description: 'Develop fishing tools (+5 food per day)'
    },
    shipyard: {
        emoji: '⚓',
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
        requires: [
            'shipyard',
            'fishing'
        ],
        description: 'Build a fishing boat, bringing 10 extra food per day.'
    }
};
var createProjects = function () {
    var container = $('.projects');
    Object.keys(projects).forEach(function (key) {
        var newProject = $$('div', 'project', null);
        var icon = $$('div', 'icon', projects[key].emoji);
        var title = $$('div', 'title', key.replace(/_/g, ' '));
        var description = $$('div', 'description', projects[key].description);
        newProject.append(icon);
        newProject.append(title);
        newProject.append(description);
        container.append(newProject);
    });
};
var dayInterval, dayCycleInterval;
var stopGame = function () {
    clearInterval(dayInterval);
    clearInterval(dayCycleInterval);
};
window.onload = function () {
    dayInterval = setInterval(nextDay, DAY);
    dayCycleInterval = setInterval(dayCycle, DAY / 2);
    updateDate();
    updateView();
    createProjects();
    log('Your ship wrecked on an unkown land. Help your remaining crew return to the seas.', null, '🏝');
};
