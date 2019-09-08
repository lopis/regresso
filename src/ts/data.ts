var initialDate = new Date('1549/08/13')
let svgBackup
let initialFood = 0
let initialWrath = 1.0
let godsWrathThereshold = 0.2

let resources
let populationTotal
let populationReady
let populationHungry
let populationStarving
let populationFishers


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

var resetData = () => {
  resources = {
    wood: 0,
    food: initialFood,
  }
  populationTotal = 15
  populationReady = 15
  populationHungry = 0
  populationStarving = 0
  populationFishers = 0
  
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
  svgBackup = $('#island').cloneNode(true)
}


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
  var $person = $$('div', 'icon', el[1])
  $person.id = el[0]
  $person.title = el[0]
  $('.ppl').append($person)
  rest.push({name: el[0], alive: true})
  return rest
}, [])

var resetPeople = () => {
  people.map(p => {
    p.alive = true
    $(`#${p.name}`).classList.remove('dead')
  })
}

var getRandomPerson = () => {
  var alive = people.filter(p => p.alive)
  return alive[Math.round(Math.random() * (alive.length - 1))]
}
var makeDeadPerson = () => {
  var person = getRandomPerson()
  person.alive = false
  $(`#${person.name}`).classList.add('dead')
  return person
}
var makePeopleDead = (n) => {
  var p = []
  for (let i = 0; i < n; i++) {
    p.push(makeDeadPerson())
  }
  return p
}

var getPeopleString = (list) => {
  if (list.length < 2) {
    return list[0]
  }
  var str = list.join(', ')
  var lastComma = str.lastIndexOf(',')

  return str.substr(0, lastComma) + ' and' + str.substr(lastComma + 1)
}