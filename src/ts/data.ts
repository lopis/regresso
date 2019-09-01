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
var bufferTimeout = 300
var bufferInterval = null
var godsWrath = 1
var isPraying = false

var dayEvents = []
var DAY = 10000
var date = new Date('1549/08/13')

const initialConditions = {
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
  date,
  dayEvents,
}
const svgBackup = $('#island').innerHTML

const people = shuffle([
  {
    name: 'Abraão'
  },
  {
    name: 'Bartolomeu'
  },
  {
    name: 'João'
  },
  {
    name: 'Jacinto'
  },
  {
    name: 'Paulo'
  },
  {
    name: 'Lindomar'
  },
  {
    name: 'Isaías'
  },
  {
    name: 'Henrique'
  },
  {
    name: 'Tomás'
  },
  {
    name: 'Amélia'
  },
  {
    name: 'Camila'
  },
  {
    name: 'Benedita'
  },
  {
    name: 'Madalena'
  },
  {
    name: 'Teresa'
  },
  {
    name: 'Lúcia'
  },
])
