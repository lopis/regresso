///<reference path="util.ts"/>
const buffer = {
  foragers: 0,
  foraging: 0,
  hunters: 0,
  hunting: 0,
  loggers: 0,
  wood: 0,
}

function fetchWood () {
  const people = 1
  population.ready -= people
  const time = DAY * 0.6
  timeout(bring('wood', people, 3, 0.05), time)
  buffer.loggers++
  initBuffer()
  updateView()
  startTrail(time, 'forageTemplate', true)
}

function pray () {
  population.ready -= 1
  isPraying = true
  timeout(() => {
    population.ready += 1
    isPraying = false
    godsWrath = godsWrath*0.7
    const person = people[Math.round(Math.random() * people.length) - 1]
    log(`${person.name} is feeling envigorated after a day at the house of God. Praise the Lord!`, null, '✝️', 'info')
  }, DAY);
}

function forage () {
  const people = 1
  population.ready -= people
  const time = DAY * 0.4
  timeout(bring('foraging', people, foragingReturns, 0), time)
  buffer.foragers++
  initBuffer()
  updateView()
  startTrail(time, 'forageTemplate', true)
}

function hunt () {
  const people = 2
  population.ready -= people
  const time = DAY * 1.2
  timeout(bring('hunting', people, 20, 0.1), time)
  buffer.hunters += people
  initBuffer()
  updateView()
  startTrail(time, 'huntTrail', true)
}

function leave () {
  log(`${population.total} people board the caravela and get ready for departure`, null, '⛵️', 'info')
  $('#newShip').classList.add('go')
  population.ready = 0
  updateView()

  if (godsWrath > 0.2) {
    timeout(() => {
      log('A violent storm suddenly forms. The ship capsizes and sinks. There are no survivors.', null, '⛈', 'info')
      population.total = 0
      updateView()
      stopGame();
    }, 7000)
  } else {
    timeout(() => {
      log('The journey back was long. They experienced perfect weather and ideal winds.', null, '🌤', 'info')
      log('Fim.', null, '🌅', 'info')
    }, 7000)
  }
}

const bring = (action, partySize, amount, risk) => () => {
  buffer[action] += amount
  initBuffer()
  const die = Math.random() < risk * attackChance
  if (!die) {
    population.ready += partySize
  } else {
    log(`Wild animals killed 1 person while ${action == 'wood' ? 'logging' : action}`, 'red', '💀', 'info')
    population.ready += partySize - 1
    population.total -= 1
    bury()
    blink('population', 'red')
  }

  if (!projects.weapons.unlocked && (die || action === 'hunting')) {
    projects.weapons.unlocked = true
    log('Hunters found dangerous animals; they could use some extra protection', 'blue', '🛡', 'info')
    blink('projects', 'blink')
    renderProject('weapons')
  }
  if (action === 'foraging' && resources.food > 80 && !huntingEnabled) {
    show('#hunt')
    blink('hunt', 'blink')
    huntingEnabled = true
    log('Animals were sighted far in the valleys, hunting may be possible.', 'blue', '🏹', 'info')
  }
  if (action === 'wood' && !projects.carpentry.unlocked && resources.wood > 5) {
    projects.carpentry.unlocked = true
    log('Develop carpentry to process wood more efficiently', 'blue', '🔨', 'info')
    renderProject('carpentry')
    blink('projects', 'blink')
  }
  if (!smokeEnabled && action === 'wood') {
    $('animate').beginElement()
    smokeEnabled = true
    log('The crew rejoices the arrival of wood for cooking and heating.', null, '🔥', 'info')
    dayEvents.push(() => {
      if (resources.wood > 0) {
        resources.wood = Math.max(0, resources.wood - 2)
        blink('wood', 'red')
      }
    })
  }

  updateView()
}

function restart () {
  resetGame()
  init()
}

const setupClickHandlers = () => {
  $a('.actions button').forEach(b => {
    on(b, 'click', window[b.id])
  })
  on($('#projects'), 'click', () => {
    $('.projects').classList.toggle('closed')
    $('#requirements').innerText = null
  })
}

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
}
const logTask = (value) => {
  if (buffer[value] < 1) return

  log(`+${buffer[value]}`, 'green', mapping[value].e, 'tasks')
  resources[mapping[value].r] += buffer[value]
  buffer[value] = 0
  blink(mapping[value].r, 'green')
}

const initBuffer = () => {
  clearInterval(bufferInterval)
  bufferInterval = setInterval(() => {
    ['foraging', 'hunting', 'wood'].forEach(logTask)

    if (buffer.foragers) {
      log(`${buffer.foragers}👤 went foraging.`, null, '🌾', 'tasks')
      buffer.foragers = 0
    }
    if (buffer.hunters) {
      log(`${buffer.hunters}👥 went hunting .`, null, '🏹', 'tasks')
      buffer.hunters = 0
    }
    if (buffer.loggers) {
      log(`${buffer.loggers}👤 went logging.`, null, '🌳', 'tasks')
      buffer.loggers = 0
    }

    updateView()
  }, bufferTimeout)
}

const blink = (resource, name) => {
  if (!$(`#${resource}`)) {
    console.log(resource, 'This doesnt exist'); return;
    
  }
  $(`#${resource}`).classList.add(name)
  timeout(() => {
    $(`#${resource}`).classList.remove(name)
  }, name === 'no' ? 400 : 100);
}

const updateFood = () => {
  let diff = resources.food - population.total

  if (diff >= 0) {
    population.hungry = population.starving
    population.starving = 0
    resources.food = diff
  } else {
    const dead = Math.min(population.starving, -diff)
    if (dead > 0) {
      log(`${dead} died from starvation.`, 'red', '💀', 'info')
      population.total -= dead
      population.ready -= dead
      population.starving = 0
      blink('population', 'red')
      bury()
    }
    
    const starving = Math.min(population.hungry, -diff)
    if (starving > 0) {
      population.starving = starving
      log(`${starving} are starving and can't work.`, 'red', '😔', 'info')
    } else {
      log(`People are getting hungry`, null, '💭', 'info')
    }
    population.hungry = Math.min(population.total - starving, -diff)
    resources.food = 0
  }
}

const enoughPeople = (min) => {
  return (population.ready - population.starving) >= min
}

const nextDay = () => {
  updateDate()
  updateFood()
  
  if ((population.total) < 1) {
    log(`Your population was decimated. <strong>Restart?<strong>`, 'restart', '☠️', 'info')
    stopGame()
    updateView()
    return
  }


  dayEvents.forEach(event => event())

  updateView()
}

const dayCycle = () => {
  $('#island').classList.toggle('night')
}
