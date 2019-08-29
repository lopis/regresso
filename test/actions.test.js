let resouces = {}
let population = {}
const updateFood = () => {
  let food = resources.food
  let starving = Math.max(0, population.starving - food)
  food = Math.max(0, food - population.starving)
  let hungry = Math.max(0, population.hungry - food)
  food = Math.max(0, food - population.hungry)

  population.starving = starving
  population.hungry = hungry

  if (population.starving > 0) {
    log(`${population.starving} died from starvation.`, 'red', '💀', 'info')
    // resources.food += 5 * population.starving
    population.total -= population.starving
    population.ready -= population.starving
    blink('food', 'green')
    blink('population', 'red')
    bury()
    population.starving = 0
  }

  if (population.hungry > 0) {
    population.starving = population.hungry
    population.hungry = 0
    log(`Due to lack of food, ${population.starving} are starving and can't work.`, 'red', '😔', 'info')
  }

  if (resources.food < population.total) {
    debug([resources.food, population.starving, starving].join(', '), '');
    
    population.hungry = population.total - resources.food - population.starving
    if (population.hungry > 1) {
      log(`People are getting hungry`, null, '💭', 'info')
    }
    resources.food = 0
  } else {
    resources.food -= population.total
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
  expect(population.hungry).toBe(0);
  expect(population.starving).toBe(0);

  updateFood()

  expect(resources.food).toBe(0);
  expect(population.total).toBe(5);
  expect(population.ready).toBe(5);
  expect(population.hungry).toBe(5);
  expect(population.starving).toBe(0);

  resources.food = 3
  updateFood()

  expect(resources.food).toBe(0);
  expect(population.total).toBe(5);
  expect(population.ready).toBe(5);
  expect(population.hungry).toBe(0);
  expect(population.starving).toBe(2);

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
  expect(population.starving).toBe(4);

  resources = {
    "food": 5 
  }
  debug = (a,b) => console.log(a, b)
  updateFood()
  expect(resources.food).toBe(0);
  expect(population.total).toBe(14);
  expect(population.ready).toBe(14);
  expect(population.hungry).toBe(5);
  expect(population.starving).toBe(4);
})
