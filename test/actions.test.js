let resouces = {}
let population = {}
const updateFood = () => {
  let food = resources.food
  let starving = Math.max(0, population.starving - food)
  food = Math.max(0, food - starving)
  let hungry = Math.max(0, population.hungry - food)
  food = Math.max(0, food - hungry)

  population.starving = starving
  population.hungry = hungry
  resources.food -= population.total

  if (population.starving > 0) {
    log(`${population.starving} died from starvation.`, 'red', '💀', 'info')
    // resources.food += 5 * population.starving
    population.total -= population.starving
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

  population.ready = population.total - population.starving

  if (resources.food < 0) {
    population.hungry = -resources.food - population.starving - starving
    resources.food = 0
  }
}

const log = () => {}
const blink = () => {}
const bury = () => {}
let debug = (a,b) => console.log(a, b)

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
  expect(population.ready).toBe(0);
  expect(population.hungry).toBe(0);
  expect(population.starving).toBe(15);
})

test('get food and then distribute', () => {
  resources.food = 5
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
  expect(population.ready).toBe(3);
  expect(population.hungry).toBe(0);
  expect(population.starving).toBe(2);
})
