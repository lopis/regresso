///<reference path="util.ts"/>
///<reference path="data.ts"/>
///<reference path="draw.ts"/>
///<reference path="actions.ts"/>
///<reference path="projects.ts"/>
let dayInterval, dayCycleInterval

const stopDays = () => {
  clearInterval(dayInterval)
  clearInterval(dayCycleInterval)
}

const stopGame = () => {
  stopDays()
  $('#island').style.filter = 'brightness(.5) contrast(1.0) saturate(0)'
}

const resumeGame = () => {
  dayInterval = setInterval(nextDay, DAY)
  dayCycleInterval = setInterval(dayCycle, DAY / 2)
  $('#days').classList.remove('paused')
}

const init = () => {
  updateDate()
  updateView()
  $('.intro').classList.add('closed')
  sinkBoatAnimation()
  setTimeout(() => {
    document.body.style.setProperty('--v', '1'); //Show village
  }, 4000)
  
  timeout(startGame, 4000)
}

const startGame = () => {
  resumeGame()
  updateDate()
  updateView()
  renderProject('caravela')
  initBuffer()

  log('People settled by the sea.', null, '⛺️', 'info')
  timeout(() => {
    log(`${makeDeadPerson().name} found good foraging grounds nearby.`, 'blue', '🌾', 'info')
    show('#forage')
    show('#restart')
    blink('forage', 'blink')
  }, 2000)

  timeout(() => {
    log(`${makeDeadPerson().name} made somerudimentary axes`, 'blue', '🌳', 'info')
    show('#fetchWood')
    blink('fetchWood', 'blink')
  }, DAY)

  timeout(() => {
    log('The river can provide you food if you develop fishing.', 'blue', '🐟', 'info')
    blink('projects', 'blink')
    renderProject('fishing')
  }, DAY * 2)
}

on($('.intro button'), 'click', () => {
  setupClickHandlers();
  init();
})