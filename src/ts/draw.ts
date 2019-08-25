let trailCount = 0
const startTrail = (time, trail, clone) => {
  const newTrail = clone ? $(`#${trail}`).cloneNode() : $(`#${trail}`)
  let id = trail
  if (clone) {
    id = 'trail' + (++trailCount)
    newTrail.id = id
    $(`#${trail}`).after(newTrail)
  }
  setTimeout(() => {
    const pathLength = Math.round($(`#${trail}`).getTotalLength())
    newTrail.style.strokeDasharray = `0,${pathLength}px,1`
  }, 100)

  setTimeout(() => {
    $(`#${id}`).style.strokeDasharray = null
  }, time/2)

  if (clone) {
    setTimeout(() => {
      $(`#${id}`).remove()
    }, time)
  }
}

const bury = () => {
  const index = $('#crosses').children.length - population.total
  if ($('#crosses').children[index]) {
    $('#crosses').children[index].style.display = 'initial'
  }
}