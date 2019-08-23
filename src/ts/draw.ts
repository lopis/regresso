const startTrail = (time) => {
  const newTrail = $('#trailTemplate').cloneNode()
  newTrail.id = 'trail1'
  $('#trailTemplate').after(newTrail)
  setTimeout(() => {
    newTrail.style.strokeDasharray = '0,100%,1,100%'
  }, 0)

  setTimeout(() => {
    $('#trail1').style.strokeDasharray = null
  }, time/2)
}

const bury = () => {
  const index = $('#crosses').children.length - population.total + 1
  if ($('#crosses').children[index]) {
    $('#crosses').children[index].style.display = 'initial'
  }
}