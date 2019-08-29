const projects = {
  caravela: {
    description: 'Build a caravela and return home. Requires a shipyard, carpentry, textiles, as well as food for the trip.',
    emoji: '⚓️',
    unlocked: false,
    cost: {
      wood: 100,
      food: 200,
      people: 10,
      days: 8,
    },
    callback: () => {}
  },
  fishing: {
    emoji: '🎣',
    unlocked: true,
    cost: {
      wood: 10,
      food: 10,
      people: 4,
      days: 2,
    },
    description: 'Develop fishing tools (+5 food per day)',
    callback: () => {
      log('Fishing preparations have been developed (+5 food per day).', 'blue', '🎣', 'info')
      show('#fh') // Fishing house
      population.ready -= 1

      setInterval(() => {
        startTrail(DAY / 2, 'fishTrail', false)
      }, DAY / 2)

      dayEvents.push(() => {
        resources.food += 5
      })
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
      blink('projects', 'blink')
      renderProject('shipyard')
    }
  },
  spinning_wheel: {
    emoji: '🧶',
    unlocked: false,
    cost: {
      wood: 10,
      food: 20,
      people: 2,
      days: 3,
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
      attackChance = attackChance * 0.25
    }
  },
  shipyard: {
    emoji: '⚓',
    unlocked: false,
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
    unlocked: false,
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
    description: 'Build a fishing boat, bringing 10 extra food per day.'
  },
}

const projectSets = {
  foraging: ['foraging'],
  fishing: ['fishing', 'fish_boat', 'high_sea_fishing'],
  hunting: ['hunting', 'traps', 'farming']
}

const createProjects = () => {
  Object.keys(projects).forEach(key => {
    if (projects[key].unlocked) {
      renderProject(key)
    }
  })
}

const resourceEmoji = {
  wood: '🌳',
  food: '🍒',
  days: 'days ⏳',
  people: '👫'
}
const getCostString = (cost) => {
  return Object.keys(cost)
    .map(key => `${cost[key]} ${resourceEmoji[key]}`)
    .join('  ')
}

const renderProject = (key) => {
  const project = projects[key]
  const $newProject = $$('div', 'project', null)
  $newProject.id = key
  $newProject.innerHTML = `
  <div class="icon">${project.emoji}</div>
  <div class="title">${key}</div>
  <div class="description">${project.description}</div>
  <div class="cost">${getCostString(project.cost)}</div>`

  $('.projects').append($newProject)
  on($newProject, 'click', selectProject(key))
}

const updateProjects = () => {

}

const selectProject = (projectName) => () => {
  const project = projects[projectName]
  if (project.done) {
    return
  }
  if (!project.unlocked) {
    blink(projectName, 'no')
    log('Conditions for construction of the new caravela have not been met.', null, '❌', 'info')
    return
  }
  
  const missing = ['wood', 'food'].filter(
    resource => resources[resource] < project.cost[resource]
  )
  if (population.ready < project.cost.people) {
    log(`Not enough people ready to start the ${projectName} project`, null, '❌', 'info')
    return 
  }
  if (missing.length > 0) {
    blink(projectName, 'no')
    log(`There is not enough ${missing.join(' and ')} to start the ${projectName} project`, null, '❌', 'info')
    return
  }

  resources.wood -= project.cost.wood
  resources.food -= project.cost.food
  population.ready -= project.cost.people
  
  project.done = true
  const $project = $(`.project#${projectName}`)
  const duration = project.cost.days * DAY
  $project.style.transition = `height ${duration}ms linear`
  $project.classList.add('in-progress')

  setTimeout(() => {
    // log(`Project ${projectName.toUpperCase()} has has been completed`, 'blue', project.emoji)
    $project.classList.add('done')
    $project.classList.remove('in-progress')
    $project.style.transition = null
    population.ready += project.cost.people

    project.callback()
    updateProjects()
  }, duration)
}