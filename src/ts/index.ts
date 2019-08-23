///<reference path="util.ts"/>
///<reference path="draw.ts"/>
///<reference path="prototype.ts"/>
///<reference path="projects.ts"/>
let dayInterval, dayCycleInterval
const stopGame = () => {
    clearInterval(dayInterval)
    clearInterval(dayCycleInterval)
}
window.onload = () => {
    setImage()
    dayInterval = setInterval(nextDay, DAY)
    dayCycleInterval = setInterval(dayCycle, DAY/2)
    updateDate()
    updateView()
    createProjects()
    log('Your ship wrecked on an unkown land. Help your remaining crew return to the seas.', null, '🏝')
};