const resources = {
  wood: 0,
  food: 0,
}
const population = {
  total: 15,
  ready: 15,
  hungry: 0,
  starving: 0,
  fishers: 0
}

let foragingReturns = 2
let huntingEnabled = false
let smokeEnabled = false
let attackChance = 1.0
let bufferTimeout = 300
let bufferInterval

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

const dayEvents = []
const DAY = 10000
let date = new Date('1549/08/13')
