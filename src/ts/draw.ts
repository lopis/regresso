let trailCount = 0
const startTrail = (time) => {
  const newTrail = $('#trailTemplate').cloneNode()
  const id = 'trail' + (++trailCount)
  newTrail.id = id
  $('#trailTemplate').after(newTrail)
  setTimeout(() => {
    newTrail.style.strokeDasharray = '0,100%,1,100%'
  }, 100)

  setTimeout(() => {
    $(`#${id}`).style.strokeDasharray = null
  }, time/2)

  setTimeout(() => {
    $(`#${id}`).remove()
  }, time)
}

const bury = () => {
  const index = $('#crosses').children.length - population.total + 1
  if ($('#crosses').children[index]) {
    $('#crosses').children[index].style.display = 'initial'
  }
}