///<reference path="util.ts"/>
const buffer = {
  foragers: 0,
  foraging: 0,
  hunters: 0,
  hunting: 0,
  loggers: 0,
  wood: 0,
}

const printScore = () => {
  const days = (date.getTime() - initialDate.getTime()) / (1000 * 60 * 60 * 24)
  const left = $('#leave').disabled
  const completed = $a('.project.done').length

  const score = [
    'Days taken', days,
    'Population saved', populationTotal,
    'Projects completed', completed,
    'Went back to the sea?', left ? 'Yes' : 'No',
  ]

  if (left) {
    score.push('Survived wrath of god?')
    score.push(godsWrath <= godsWrathThereshold ? 'Yes' : 'No')
  }

  const total = Math.ceil(
    (populationTotal * 25 + completed * 7 + (left ? 10 : 0)) * (1 - godsWrath) * (30 / days)
  )

  $('#score-board .modal .content').innerHTML = score.map(
    value => `<span>${value}</span>`
  ).join('') + `<p>Final Score</p><p>${total} pts</p>`
  openModal('score-board')
}

const bring = (action, partySize, amount, risk) => () => {
  buffer[action] += amount
  initBuffer()
  const die = Math.random() < risk * attackChance
  if (!die) {
    populationReady += partySize
  } else {
    log(`Wild animals killed ${makeDeadPerson().name} while ${action == 'wood' ? 'logging' : action}`, 'red', '💀', 'info')
    populationReady += partySize - 1
    populationTotal -= 1
    blink('population', 'red')
  }

  if (!projects.weapons.unlocked && (die || action === 'hunting')) {
    projects.weapons.unlocked = true
    log('Hunters found dangerous animals; you need extra protection', 'blue', '🛡', 'info')
    blink('projects', 'blink')
    renderProject('weapons')
  }
  if (!huntingEnabled && (resources.food + buffer.foraging) > 80) {
    show('#hunt')
    blink('hunt', 'blink')
    huntingEnabled = true
    log('Animals were sighted far in the valleys, hunting may be possible.', 'blue', '🏹', 'info')
  }
  if (action === 'wood') {
    if (!projects.carpentry.unlocked && (resources.wood + buffer.wood) > 5) {
      projects.carpentry.unlocked = true
      log('Develop carpentry to process wood more efficiently', 'blue', '🔨', 'info')
      renderProject('carpentry')
      blink('projects', 'blink')
    }
    if (!smokeEnabled) {
      $('animate').beginElement()
      smokeEnabled = true
      log('The crew rejoices the arrival of wood for cooking and heating.', null, '🔥', 'info')
      dayEvents.push(() => {
        if (resources.wood > 0) {
          resources.wood = Math.max(0, resources.wood - 2)
          if (!projects.carpentry.done) {
            blink('wood', 'red')
          }
        }
      })
    }
  }

  updateView()
}

function restart () {
  resetGame()
  init()
}

const handlers = {
  leave: () => {
    log(`${populationTotal} people board the caravela and get ready for departure`, null, '⛵️', 'info')
    $('#ship').classList.add('go')
    $('#leave').disabled = true
    hide('#fishTrail')
    hide('#boatTrail')
    populationReady = 0
    updateView()
    clearAllTimers()
  
    if (godsWrath > 0.2) {
      timeout(() => {
        log('A violent storm suddenly formed. The ship sank and there were no survivors.', null, '⛈', 'info')
        populationTotal = 0
        updateView()
        stopGame();
        timeout(printScore, 5000);
      }, 7000)
    } else {
      timeout(() => {
        log('The journey back was long, but the weather was perfect.', null, '🌤', 'info')
        log('Fim.', null, '🌅', 'info')
        timeout(printScore, 5000);
      }, 7000)
    }
  },
  fetchWood: () => {
    const people = 1
    populationReady -= people
    const time = DAY * 0.6
    timeout(bring('wood', people, 3, 0.03), time)
    buffer.loggers++
    initBuffer()
    updateView()
    startTrail(time, 'ft', true) // Forage Trail
  },
  
  pray: () => {
    populationReady -= 1
    isPraying = true
    timeout(() => {
      populationReady += 1
      isPraying = false
      godsWrath = godsWrath*0.7
      const person = getRandomPerson()
      log(`${person.name} is feeling envigorated after a day at the house of God. Praise the Lord!`, null, '✝️', 'info')
    }, DAY);
  },
  
  forage: () => {
    const people = 1
    populationReady -= people
    const time = DAY * 0.4
    timeout(bring('foraging', people, foragingReturns, 0), time)
    buffer.foragers++
    initBuffer()
    updateView()
    startTrail(time, 'ft', true) // Forage Trail
  },
  
  hunt: () => {
    const people = 2
    populationReady -= people
    const time = DAY * 1.2
    timeout(bring('hunting', people, 20, 0.1), time)
    buffer.hunters += people
    initBuffer()
    updateView()
    startTrail(time, 'huntTrail', true)
  },

  restart: () => {
    if (confirm('Restart current game?')) {
      restart()
    }
  }
}

const setupClickHandlers = () => {
  $a('.actions button').forEach(b => {
    on(b, 'click', handlers[b.id])
  })
  on($('#projects'), 'click', () => {
    $projects.classList.toggle('closed')
    $('#requirements').innerText = null
  })
  on($('#score-board button'), 'click', restart)
  on($('.dismiss'), 'click', () => {
    closeModal('score-board')
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
  $(`#${resource}`).classList.add(name)
  timeout(() => {
    $(`#${resource}`).classList.remove(name)
  }, name === 'no' ? 400 : 100);
}

const updateFood = () => {
  let diff = resources.food - populationTotal
  blink('food', 'red')

  if (diff >= 0) {
    populationHungry = populationStarving
    populationStarving = 0
    resources.food = diff
  } else {
    const dead = Math.min(populationStarving, -diff)
    if (dead > 0) {
      log(`${getPeopleString(makePeopleDead(dead).map(p=>p.name))} died from starvation.`, 'red', '💀', 'info')
      populationTotal -= dead
      populationReady -= dead
      populationStarving = 0
      blink('population', 'red')
    }
    
    const starving = Math.min(populationHungry, -diff)
    populationHungry = Math.min(populationTotal - starving, -diff)
    if (starving > 0) {
      populationStarving = starving
      log(`${starving} are starving and can't work.`, 'red', '😔', 'info')
    } else if (populationHungry > 0) {
      log(`${getRandomPerson().name} ${populationHungry > 2 ? `and ${populationHungry - 1} others are` : 'is'} getting hungry`, null, '💭', 'info')
    }
    resources.food = 0
  }
}

const enoughPeople = (min) => {
  return (populationReady - populationStarving) >= min
}

const nextDay = () => {
  updateDate()
  updateFood()
  
  if ((populationTotal) < 1) {
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
