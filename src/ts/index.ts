///<reference path="util.ts"/>
///<reference path="data.ts"/>
///<reference path="draw.ts"/>
///<reference path="actions.ts"/>
///<reference path="projects.ts"/>
let dayInterval, dayCycleInterval
const stopGame = () => {
  clearInterval(dayInterval)
  clearInterval(dayCycleInterval)
  $('svg').style.filter = 'brightness(.5) contrast(1.0) saturate(0)'
}
window.onload = () => {
  dayInterval = setInterval(nextDay, DAY)
  dayCycleInterval = setInterval(dayCycle, DAY / 2)
  updateDate()
  updateView()
  renderProject('caravela')

  log('Your ship wrecked on an unkown land. Help your remaining crew return to the seas.', null, '🏝', 'info')
  setTimeout(() => {
    log('A scouting team has found good foraging grounds nearby.', 'blue', '🌾', 'info')
    show('#forage')
    blink('forage', 'blink')
  }, 2000)

  setTimeout(() => {
    log('By crafting simple tools, logging and wood working is now possible.', 'blue', '🌳', 'info')
    show('#chop-wood')
    blink('chop-wood', 'blink')
  }, DAY)

  setTimeout(() => {
    log('The river delta could provide you with food if you would develop fishing.', 'blue', '🐟', 'info')
    blink('projects', 'blink')
    renderProject('fishing')
  }, DAY * 2)
};