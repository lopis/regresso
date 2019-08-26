///<reference path="util.ts"/>
on($('#chop-wood'), 'click', () => fetchWood())
on($('#forage'), 'click', () => forage())
on($('#hunt'), 'click', () => hunt())

const buffer = {
  foragers: 0,
  foraging: 0,
  hunters: 0,
  hunting: 0,
  loggers: 0,
  wood: 0,
}

const fetchWood = () => {
  population.ready -= -1
  const time = DAY * 0.6
  setTimeout(bring('wood', 1, 3, 0.05), time)
  buffer.loggers++
  updateView()
  startTrail(time, 'forageTemplate', true)

  if (!projects.carpentry.unlocked && resources.wood > 5) {
    projects.carpentry.unlocked = true
    log('Develop carpentry to process wood more efficiently', 'blue', '🔨', 'info')
    renderProject('carpentry')
    blink('projects', 'blink')
  }
}

let huntingEnabled = false
const forage = () => {
  population.ready -= 1
  const time = DAY * 0.4
  setTimeout(bring('foraging', 1, 2, 0), time)
  buffer.foragers++
  updateView()
  startTrail(time, 'forageTemplate', true)

  if (resources.food > 100 && !huntingEnabled) {
    show('#hunt')
    blink('hunt', 'blink')
    huntingEnabled = true
    log('Animals were sighted far in the valleys, hunting may be possible.', 'blue', '🏹', 'info')
  }
}

const hunt = () => {
  population.ready -= 1
  const time = DAY * 1.2
  setTimeout(bring('hunting', 1, 4, 0.1), time)
  buffer.hunters++
  updateView()
  startTrail(time, 'huntTrail', true)

  if (!projects.weapons.unlocked) {
    projects.weapons.unlocked = true
    log('Hunters found dangerous animals; they could use some extra protection', 'blue', '🛡', 'info')
    blink('projects', 'blink')
    renderProject('weapons')
  }
}

let attackChance = 1.0
const bring = (resource, partySize, amount, risk) => () => {
  buffer[resource] += amount
  if (Math.random() > risk * attackChance) {
    population.ready += partySize
  } else {
    log(`A party got attacked by wild animals while ${resource == 'wood' ? 'logging' : resource}. 1 person died`, 'red', '💀', 'info')
    population.ready += partySize - 1
    population.total -= 1
    bury()
    blink('population', 'red')
  }
  updateView()
}
setInterval(() => {
  if (buffer.foraging) {
    log(`Foragers have collected ${buffer.foraging} food.`, 'green', '🌾', 'tasks')
    resources.food += buffer.foraging
    buffer.foraging = 0
    blink('food', 'green')
  }
  if (buffer.hunting) {
    log(`Hunters have hunted ${buffer.hunting} food.`, 'green', '🏹', 'tasks')
    resources.food += buffer.hunting
    buffer.hunting = 0
    blink('food', 'green')
  }
  if (buffer.wood) {
    log(`Loggers have brought back ${buffer.wood} wood.`, 'green', '🌳', 'tasks')
    resources.wood += buffer.wood
    buffer.wood = 0
    blink('wood', 'green')
  }
  if (buffer.foragers) {
    log(`${buffer.foragers} people went foraging for food.`, null, '🌾', 'tasks')
    buffer.foragers = 0
  }
  if (buffer.hunters) {
    log(`${buffer.hunters} people left to search game to hunt.`, null, '🏹', 'tasks')
    buffer.hunters = 0
  }
  if (buffer.loggers) {
    log(`${buffer.loggers} people set off to bring wood.`, null, '🌳', 'tasks')
    buffer.loggers = 0
  }
}, 1500)

const blink = (resource, name) => {
  $(`#${resource}`).classList.add(name)
  setTimeout(() => {
    $(`#${resource}`).classList.remove(name)
  }, name === 'no' ? 400 : 100);
}

const updateView = () => {
  $('#wood .value').innerText = resources.wood
  $('#food .value').innerText = resources.food

  $('#population .value').innerText = population.total
  $('#ready .value').innerText = population.ready
  $('#hungry .value').innerText = population.hungry
  if (population.hungry < 1) {
    $('#hungry').classList.add('hidden')
  } else {
    $('#hungry').classList.remove('hidden')
  }
  
  $('#forage').disabled = population.ready < 2
  $('#chop-wood').disabled = population.ready < 2
  $('#hunt').disabled = population.ready < 4
}

const updateDate = () => {
  date.setDate(date.getDate() + 1)
  $('#days .value').innerText = `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`
}

const nextDay = () => {
  updateDate()
  
  if ((population.total) < 1) {
    log(`Your population was decimated`, 'red', '☠️', 'info')
    stopGame()
  }
  if (population.hungry > 0) {
    population.hungry -= 1
    population.total -= 1
    log(`One person has died from starvation. +5 food.`, 'red', '💀', 'info')
    resources.food += 5
    blink('food', 'green')
    blink('population', 'red')
    bury()
  }
  
  population.ready += population.hungry
  population.hungry = 0

  resources.food -= population.ready
  if (resources.food < 0) {
    population.ready += resources.food
    population.hungry += -resources.food
    resources.food = 0
    log(`Due to lack of food, ${population.hungry} are starving and can't work.`, 'red', '😔', 'info')
  }

  dayEvents.forEach(event => event())

  updateView()
}

const dayCycle = () => {
  $('svg').classList.toggle('night')
}
