let resouces = {}
let population = {}
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

const log = () => {}
const blink = () => {}
const bury = () => {}
let debug = () => {}
// debug = (a,b) => console.log(a, b)

test('food and population updates correctly', () => {
  resources = {
    wood: 0,
    food: 15,
  }
  population = {
    total: 15,
    ready: 15,
    hungry: 0,
    starving: 0,
    hurt: 0,
  }

  updateFood()

  expect(resources.food).toBe(0);
  expect(population.total).toBe(15);
  expect(population.ready).toBe(15);
  expect(population.hungry).toBe(0);
  expect(population.starving).toBe(0);

  updateFood()

  expect(resources.food).toBe(0);
  expect(population.total).toBe(15);
  expect(population.ready).toBe(15);
  expect(population.hungry).toBe(15);
  expect(population.starving).toBe(0);

  updateFood()

  expect(resources.food).toBe(0);
  expect(population.total).toBe(15);
  expect(population.ready).toBe(15);
  expect(population.hungry).toBe(0);
  expect(population.starving).toBe(15);
})

test('get food and then distribute', () => {
  resources.food = 5
  population = {
    total: 15,
    ready: 15,
    hungry: 0,
    starving: 15,
  }
  updateFood()

  expect(resources.food).toBe(0);
  expect(population.total).toBe(5);
  expect(population.ready).toBe(5);
  expect(population.hungry).toBe(5);
  expect(population.starving).toBe(0);

  updateFood()

  expect(resources.food).toBe(0);
  expect(population.total).toBe(5);
  expect(population.ready).toBe(5);
  expect(population.hungry).toBe(0);
  expect(population.starving).toBe(5);

  resources.food = 3
  updateFood()

  expect(resources.food).toBe(0);
  expect(population.total).toBe(3);
  expect(population.ready).toBe(3);
  expect(population.hungry).toBe(2);
  expect(population.starving).toBe(0);

  population = {
    "total": 14,   // (14-9=5) become hungry
    "ready": 14,
    "hungry": 9,   // 9 -> 5 get fed
    "starving": 0, //   -> 4 become starving
    "hurt": 0
  }
  resources = {
    "wood": 45,
    "food": 5 
  }
  updateFood()
  expect(resources.food).toBe(0);
  expect(population.total).toBe(14);
  expect(population.ready).toBe(14);
  expect(population.hungry).toBe(5);
  expect(population.starving).toBe(9);

  resources = {
    "food": 5 
  }
  debug = (a,b) => console.log(a, b)
  updateFood()
  expect(resources.food).toBe(0);
  expect(population.total).toBe(5);
  expect(population.ready).toBe(5);
  expect(population.hungry).toBe(0);
  expect(population.starving).toBe(5);
})
