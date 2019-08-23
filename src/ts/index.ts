///<reference path="util.ts"/>
///<reference path="draw.ts"/>
///<reference path="prototype.ts"/>
///<reference path="projects.ts"/>
let dayInterval
const stopGame = () => {
    clearInterval(dayInterval)
}
window.onload = () => {
    setImage()
    dayInterval = setInterval(nextDay, DAY)
    updateDate()
    updateView()
    createProjects()
    log('Your ship wrecked on an unkown land. Help your remaining crew return to the seas.', null, '🏝')
};