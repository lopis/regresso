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
    if (trail == 'huntTrail') {
      newTrail.style.strokeDasharray = `0,${pathLength}px,0.5,1,0.5,1,0.5,1,0.5,100%`      
    } else {
      newTrail.style.strokeDasharray = `0,${pathLength}px,${trail == 'boatTrail' ? 2 : 1}`
    }
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

const updateView = () => {
  $('#wood .value').innerText = r.wood
  $('#food .value').innerText = r.food

  $('#population .value').innerText = p.total
  $('#ready .value').innerText = Math.max(0, p.ready - p.starving)
  $('#starving .value').innerText = p.starving
  if (p.starving < 1) {
    $('#starving').classList.add('hidden')
  } else {
    $('#starving').classList.remove('hidden')
  }

  $('#fishers .value').innerText = p.fishers
  if (p.fishers < 1) {
    $('#fishers').classList.add('hidden')
  } else {
    $('#fishers').classList.remove('hidden')
  }
  
  $('#forage').disabled = !enoughPeople(1)
  $('#fetchWood').disabled = !enoughPeople(1)
  $('#hunt').disabled = !enoughPeople(2)
  $('#pray').disabled = !enoughPeople(1) || isPraying
}

const updateDate = () => {
  date.setDate(date.getDate() + 1)
  $('#days .value').innerText = `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`
}

const sinkBoatAnimation = () => {
  $('#sail').beginElement()
  $('#sink').beginElement()
  $('#sinkRotate').beginElement()
}