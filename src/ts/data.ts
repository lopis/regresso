const svgBackup = $('#island').innerHTML
const initialDate = new Date('1549/08/13')
let initialFood = 0
let initialWrath = 1.0
let godsWrathThereshold = 0.2

let resources
let population
let foragingReturns
let huntingEnabled
let smokeEnabled
let attackChance
let bufferTimeout
let bufferInterval
let godsWrath
let isPraying
let dayEvents
let DAY
let date = new Date(initialDate)

const resetData = () => {
  resources = {
    wood: 0,
    food: initialFood,
  }
  population = {
    total: 15,
    ready: 15,
    hungry: 0,
    starving: 0,
    fishers: 0
  }
  
  foragingReturns = 2
  huntingEnabled = false
  smokeEnabled = false
  attackChance = 1.0
  bufferTimeout = 400
  bufferInterval = null
  godsWrath = 1.0
  isPraying = false
  
  dayEvents = []
  DAY = 10000
  date = new Date(initialDate)
}


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
  const $person = $$('div', 'icon', el[1])
  $person.id = el[0]
  $person.title = el[0]
  $('.people').append($person)
  rest.push({name: el[0], alive: true})
  return rest
}, [])

const resetPeople = () => {
  people.map(p => {
    p.alive = true
    $(`#${p.name}`).classList.remove('dead')
  })
}

let deadPeople = 0
const getRandomPerson = () => {
  const alive = people.filter(p => p.alive)
  return alive[Math.round(Math.random() * (alive.length - 1))]
}
const makeDeadPerson = () => {
  deadPeople++
  const person = getRandomPerson()
  person.alive = false
  $(`#${person.name}`).classList.add('dead')
  return person
}
const makePeopleDead = (n) => {
  const p = []
  for (let i = 0; i < n; i++) {
    p.push(makeDeadPerson())
  }
  return p
}