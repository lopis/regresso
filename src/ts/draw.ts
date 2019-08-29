let trailCount = 0
const startTrail = (time, trail, clone) => {
  const newTrail = clone ? $(`#${trail}`).cloneNode() : $(`#${trail}`)
  let id = trail
  if (clone) {
    id = 'trail' + (++trailCount)
    newTrail.id = id
    $(`#${trail}`).after(newTrail)
  }
  st(() => {
    const pathLength = Math.round($(`#${trail}`).getTotalLength())
    if (trail == 'huntTrail') {
      newTrail.style.strokeDasharray = `0,${pathLength}px,0.5,1,0.5,1,0.5,1,0.5,100%`      
    } else {
      newTrail.style.strokeDasharray = `0,${pathLength}px,1`
    }
  }, 100)

  st(() => {
    $(`#${id}`).style.strokeDasharray = null
  }, time/2)

  if (clone) {
    st(() => {
      $(`#${id}`).remove()
    }, time)
  }
}

const bury = () => {
  return
  // const index = $('#crosses').children.length - population.total
  // if ($('#crosses').children[index]) {
  //   $('#crosses').children[index].style.display = 'initial'
  // }
}

const updateView = () => {
  $('#wood .value').innerText = resources.wood
  $('#food .value').innerText = resources.food

  $('#population .value').innerText = population.total
  $('#ready .value').innerText = Math.max(0, population.ready - population.starving)
  $('#starving .value').innerText = population.starving
  if (population.starving < 1) {
    $('#starving').classList.add('hidden')
  } else {
    $('#starving').classList.remove('hidden')
  }
  
  $('#forage').disabled = !enoughPeople(1)
  $('#chop-wood').disabled = !enoughPeople(1)
  $('#hunt').disabled = !enoughPeople(2)
}

const updateDate = () => {
  date.setDate(date.getDate() + 1)
  $('#days .value').innerText = `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`
}