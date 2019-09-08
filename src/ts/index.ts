///<reference path="util.ts"/>
///<reference path="data.ts"/>
///<reference path="draw.ts"/>
///<reference path="actions.ts"/>
///<reference path="projects.ts"/>
let dayInterval, dayCycleInterval

var stopDays = () => {
  clearInterval(dayInterval)
  clearInterval(dayCycleInterval)
}

var stopGame = () => {
  stopDays()
  $('#island').style.filter = 'brightness(.5) contrast(1.0) saturate(0)'
}

var resumeGame = () => {
  dayInterval = setInterval(nextDay, DAY)
  dayCycleInterval = setInterval(dayCycle, DAY / 2)
}

var init = () => {
  resetData()
  updateDate()
  updateView()
  closeModal('intro')
  sinkBoatAnimation()
  setTimeout(() => {
    document.body.style.setProperty('--v', '1'); //Show village
  }, 4000)
  
  timeout(startGame, 4000)
}

var startGame = () => {
  resetData()
  initProjects()
  updateDate()
  updateView()
  resumeGame()
  renderProject('caravela')
  initBuffer()

  log('People settled by the sea.', null, '⛺️', 'info')
  timeout(() => {
    log(`${getRandomPerson().name} found good foraging grounds nearby.`, 'blue', '🌾', 'info')
    show('#forage')
    show('#restart')
    blink('forage', 'blink')
  }, 2000)

  timeout(() => {
    log(`${getRandomPerson().name} made some rudimentary axes for logging`, 'blue', '🌳', 'info')
    show('#fetchWood')
    blink('fetchWood', 'blink')
  }, DAY)

  timeout(() => {
    log('The river can provide you food if you develop fishing.', 'blue', '🐟', 'info')
    blink('projects', 'blink')
    renderProject('fishing')
  }, DAY * 2)
}

on($('#intro button'), 'click', () => {
  setupClickHandlers();
  init();
})

// @ts-ignore
if(document.monetization && document.monetization.state === 'started') {
  display('#coil')
  godsWrathThereshold = 0.3
  initialFood = 30
}