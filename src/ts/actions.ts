///<reference path="util.ts"/>
on($('#chop-wood'), 'click', () => fetchWood())
on($('#forage'), 'click', () => forage())
on($('#hunt'), 'click', () => hunt())

const fetchWood = () => {
  population.ready -= 2
  const time = DAY * 0.6
  setTimeout(bring('wood', 2, 5, 0.05), time)
  log('2 people set off to bring wood.', null, '🌳', 'tasks')
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
  population.ready -= 2
  const time = DAY * 0.4
  setTimeout(bring('food', 2, 4, 0), time)
  log('2 people have gone foraging.', null, '🌾', 'tasks')
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
  population.ready -= 4
  const time = DAY * 1.2
  setTimeout(bring('food', 4, 12, 0.1), time)
  log('4 hunters left to bring food.', null, '🏹', 'tasks')
  updateView()
  startTrail(time, 'trailTemplate', true)
}

const bring = (resource, partySize, amount, risk) => () => {
  if (Math.random() > risk) {
    log(`A party of ${partySize} has returned with ${amount} ${resource} successfully.`, 'green', '🌟', 'tasks')
    resources[resource] += amount
    population.ready += partySize
  } else {
    log(`A party of ${partySize} returned from fetching ${resource}, but got attacked by wild animals. 1 person died`, 'red', '💀', 'info')
    resources[resource] += Math.floor(amount / 2)
    population.ready += partySize - 1
    population.total -= 1
    bury()
    blink('population', 'red')
  }
  updateView()
  blink(resource, 'green')
}

const blink = (resource, color) => {
  $(`#${resource}`).classList.add(color)
  setTimeout(() => {
    $(`#${resource}`).classList.remove(color)
  }, 100);
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
