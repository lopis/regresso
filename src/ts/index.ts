///<reference path="util.ts"/>
///<reference path="data.ts"/>
///<reference path="draw.ts"/>
///<reference path="actions.ts"/>
///<reference path="projects.ts"/>
let dayInterval, dayCycleInterval
const stopGame = () => {
    clearInterval(dayInterval)
    clearInterval(dayCycleInterval)
}
window.onload = () => {
    dayInterval = setInterval(nextDay, DAY)
    dayCycleInterval = setInterval(dayCycle, DAY/2)
    updateDate()
    updateView()
    log('Your ship wrecked on an unkown land. Help your remaining crew return to the seas.', null, '🏝')
    setTimeout(() => {
      log('A scouting team has found good foraging grounds nearby.', null, '🌾')
      show('#forage')
    }, 2000)

    setTimeout(() => {
      log('The river delta could provide you with food if you would develop fishing.', null, '🐟')
      renderProject('fishing')
      show('#projects')
    }, DAY)
};