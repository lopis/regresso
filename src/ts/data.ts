var resources = {
  wood: 0,
  food: 0,
}
var population = {
  total: 15,
  ready: 15,
  hungry: 0,
  starving: 0,
  fishers: 0
}

var foragingReturns = 2
var huntingEnabled = false
var smokeEnabled = false
var attackChance = 1.0
var bufferTimeout = 400
var bufferInterval = null
var godsWrath = 1
var godsWrathThereshold = 0.2
var isPraying = false

var dayEvents = []
var DAY = 10000
var date = new Date('1549/08/13')

const initCon = {
  resources: Object.assign({}, resources),
  population: Object.assign({}, population),
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
}
const svgBackup = $('#island').innerHTML

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