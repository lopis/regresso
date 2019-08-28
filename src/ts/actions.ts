///<reference path="util.ts"/>
const buffer = {
  foragers: 0,
  foraging: 0,
  hunters: 0,
  hunting: 0,
  loggers: 0,
  wood: 0,
}

const fetchWood = () => {
  const people = 1
  population.ready -= people
  const time = DAY * 0.6
  setTimeout(bring('wood', people, 3, 0.05), time)
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
  const people = 1
  population.ready -= people
  const time = DAY * 0.4
  setTimeout(bring('foraging', people, 2, 0), time)
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
  const people = 2
  population.ready -= people
  const time = DAY * 1.2
  setTimeout(bring('hunting', people, 8, 0.1), time)
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

const setupClickHandlers = () => {
  on($('#chop-wood'), 'click', () => fetchWood())
  on($('#forage'), 'click', () => forage())
  on($('#hunt'), 'click', () => hunt())
}

const initBuffer = () => {
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
}

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
  $('#ready .value').innerText = population.ready - population.starving
  $('#starving .value').innerText = population.starving
  if (population.starving < 1) {
    $('#starving').classList.add('hidden')
  } else {
    $('#starving').classList.remove('hidden')
  }
  
  $('#forage').disabled = population.ready < 1
  $('#chop-wood').disabled = (population.ready - population.starving) < 1
  $('#hunt').disabled = population.ready < 2
}

const updateDate = () => {
  date.setDate(date.getDate() + 1)
  $('#days .value').innerText = `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`
}

const updateFood = () => {
  let food = resources.food
  let starving = Math.max(0, population.starving - food)
  food = Math.max(0, food - starving)
  let hungry = Math.max(0, population.hungry - food)
  food = Math.max(0, food - hungry)

  population.starving = starving
  population.hungry = hungry
  resources.food -= population.total

  if (population.starving > 0) {
    log(`${population.starving} died from starvation.`, 'red', '💀', 'info')
    // resources.food += 5 * population.starving
    population.total -= population.starving
    blink('food', 'green')
    blink('population', 'red')
    bury()
    population.starving = 0
  }

  if (population.hungry > 0) {
    population.starving = population.hungry
    population.hungry = 0
    log(`Due to lack of food, ${population.starving} are starving and can't work.`, 'red', '😔', 'info')
  }

  // population.ready = population.total - population.starving

  if (resources.food < 0) {
    population.hungry = -resources.food - population.starving - starving
    if (population.hungry > 1) {
      log(`People are getting hungry`, null, '💭', 'info')
    }
    resources.food = 0
  }
}

const nextDay = () => {
  updateDate()
  updateFood()
  
  if ((population.total) < 1) {
    log(`Your population was decimated`, 'red', '☠️', 'info')
    stopGame()
    updateView()
    return
  }


  dayEvents.forEach(event => event())

  updateView()
}

const dayCycle = () => {
  $('svg').classList.toggle('night')
}
