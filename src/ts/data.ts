var r = {
  wood: 0,
  food: 0,
}
var p = {
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
var isPraying = false

var dayEvents = []
var DAY = 10000
var date = new Date('1549/08/13')

const initCon = {
  r: Object.assign({}, r),
  p: Object.assign({}, p),
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
  'Abraão',
  'Bartolomeu',
  'João',
  'Jacinto',
  'Paulo',
  'Lindomar',
  'Isaías',
  'Henrique',
  'Tomás',
  'Amélia',
  'Camila',
  'Benedita',
  'Madalena',
  'Teresa',
  'Lúcia',
]).reduce((rest, el) => {
  rest.push({name: el, alive: true})
  return rest
}, [])

const getRandomPerson = () => {
  const alive = people.filter(p => p.alive)
  return alive[Math.round(Math.random() * (alive.length - 1))]
}
const makeDeadPerson = () => {
  const person = getRandomPerson()
  person.alive = false
  return person
}
const makePeopleDead = (n) => {
  const p = []
  for (let i = 0; i < n; i++) {
    p.push(makeDeadPerson())
  }
  return p
}