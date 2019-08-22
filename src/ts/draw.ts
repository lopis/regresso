const $ = q => document.querySelector(q)
const canvas = $('canvas')
const ctx = canvas.getContext('2d')
let size = Math.min(window.innerHeight, window.innerWidth)  * 0.9
const cellNum = 100
const islandSize = Math.round(cellNum * 0.9)
const beachSize = 6
const d = Math.round(size / cellNum)
size = d * cellNum

const TYPE_TREE = 0
const TYPE_ROCK = 1
const TYPE_WATER = 2
const TYPE_SETTLEMENT = 3
const TYPE_BASE = 4

const islandOffset = {
  x: Math.round((cellNum - islandSize) / 2),
  y: Math.round((cellNum - islandSize) / 2)
}

let shadowRadius = cellNum / 4

const stock = {
  wood: 15,
  water: 50,
  textile: 0,
  food: 40,
  metal: 10,
  tools: 5,
  pop: 40
}

canvas.height = size
canvas.width = size

const colors = {
  [TYPE_TREE]: '#07625c',
  [TYPE_SETTLEMENT]: '#622f07',
  [TYPE_BASE]: '#78563b',
  [TYPE_ROCK]: '#aaaaaa',
  ocean: '#24bae3',
  grass: '#0a866b',
  sand:  '#ecdf89',
  unknown: '#097592',
}

const objects = []
const grid = []

for (let i = 0; i < cellNum; i++) {
  grid.push([])
}

function getRandomCircleCoords() {
  const x = Math.random() * 2 - 1
  const y = Math.random() * 2 - 1

  if (1 - y * y / 2 < 0 || 1 - x * x / 2 < 0) {
    console.error('NaN', x, y)
  }

  return [
    (x * Math.sqrt(1 - y * y / 2) + 1) / 2, 
    (y * Math.sqrt(1 - x * x / 2) + 1) / 2
  ];
}

function makeObject (x, y, type) {
  const newObject = {
    x,
    y,
    type
  }
  objects.push(newObject)
  grid[newObject.x][newObject.y] = newObject
}

function isShadow (x, y) {
  return (
      (x - cellNum/2)**2
    + (y - cellNum*0.75)**2
    > shadowRadius**2
  )
}

const rockSpread = 0.25
const rockOffset = 0.3
for (let i = 0; i < cellNum * 2; i++) {
  const [randX, randY] = getRandomCircleCoords()
  const x = Math.round((randX * rockSpread + rockOffset) * islandSize)
  const y = Math.round((randY * rockSpread + rockOffset) * islandSize)
  makeObject(x, y, TYPE_ROCK)
  makeObject(x+1, y, TYPE_ROCK)
  makeObject(x+1, y+1, TYPE_ROCK)
  makeObject(x, y+1, TYPE_ROCK)
}

const treeSpread = 0.5
const treeOffset = 0.25
for (let i = 0; i < cellNum * 2; i++) {
  const [randX, randY] = getRandomCircleCoords()
  const x = Math.round((randX * treeSpread + treeOffset) * islandSize)
  const y = Math.round((randY * treeSpread + treeOffset) * islandSize)
  makeObject(x, y, TYPE_TREE)
  makeObject(x+1, y, TYPE_TREE)
  makeObject(x+1, y+1, TYPE_TREE)
  makeObject(x, y+1, TYPE_TREE)
}

const xPos = cellNum/2
const yPos = cellNum*0.75
makeObject(xPos,   yPos,   TYPE_SETTLEMENT)
makeObject(xPos,   yPos+1, TYPE_BASE)
makeObject(xPos+1, yPos+1, TYPE_BASE)
makeObject(xPos+1, yPos,   TYPE_BASE)
makeObject(xPos+1, yPos-1, TYPE_BASE)
makeObject(xPos-1, yPos,   TYPE_BASE)
makeObject(xPos-1, yPos-1, TYPE_BASE)
makeObject(xPos,   yPos-1, TYPE_BASE)
makeObject(xPos-1, yPos+1, TYPE_BASE)


console.log({grid, objects})

const draw = () => {
  ctx.fillStyle = colors.unknown;
  ctx.fillRect(0, 0, size, size); 
  let deltaX = 1
  let deltaY = -1

  for (let i = 0; i < cellNum; i++) {
    for (let j = 0; j < cellNum; j++) {
      const xMax = islandOffset.x + beachSize + 2 * Math.random()
      const yMax = islandOffset.y + beachSize + 2 * Math.random()
      const xMin = islandSize - 2 * Math.random() - beachSize
      const yMin = islandSize - 2 * Math.random() - beachSize

      if (!isShadow(i, j)) {
        if (i < xMax - 3 || i >= xMin + 3 || j < yMax - 3 || j >= yMin + 3) {
          ctx.fillStyle = colors.ocean
        } else if (i < xMax || i >= xMin || j < yMax || j >= yMin) {
          ctx.fillStyle = colors.sand
        } else {
          ctx.fillStyle = colors.grass
        }
        ctx.fillRect(i * d, j * d, d, d)
      }
    }
  }
  
  objects.forEach(object => {
    if (!isShadow(object.x, object.y)) {
      ctx.fillStyle = colors[object.type]
      ctx.fillRect(
        (object.x) * d,
        (object.y) * d,
        d, d
      )
    }
  })
  
  ctx.fillStyle = '#00000033'
  ctx.fillRect(0, 0, size, d*4)
  ctx.font = '15px Monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ddd';
  ctx.fillText('🌴 ' + stock.wood, d, d*2);
  ctx.fillText('💧 ' + stock.water, d*10, d*2);
  ctx.fillText('🍎 ' + stock.food, d*20, d*2);
  ctx.fillText('🧵 ' + stock.textile, d*30, d*2);
}

draw()

canvas.addEventListener('click', e => {
  const x = Math.floor((e.pageX - canvas.offsetLeft) / d)
  const y = Math.floor((e.pageY - canvas.offsetTop) / d)

  console.log(x, y)
  const object = grid[x][y]
  console.log(object ? object.type : 'none');
  
}, false);