let trailCount = 0
const startTrail = (time, trailId, clone) => {
  const $trail = $(`#${trailId}`)
  const $newTrail = clone ? $trail.cloneNode() : $trail
  let id = trailId
  if (clone) {
    id = 'trail' + (++trailCount)
    $newTrail.id = id
    $trail.after($newTrail)
  }
  setTimeout(() => {
    const pathLength = Math.round($trail.getTotalLength())
    if (trailId == 'huntTrail') {
      $newTrail.style.strokeDasharray = `0,${pathLength}px,0.5,1,0.5,1,0.5,1,0.5,100%`      
    } else {
      if (trailId == 'ft') { // Forage Trail
        $newTrail.style.transform = `scaleX(${1 + Math.random()*0.7 - 0.2})`;
      }
      $newTrail.style.strokeDasharray = `0,${pathLength}px,${trailId == 'boatTrail' ? 2 : 1}`
    }
  }, 100)

  setTimeout(() => {
    $newTrail.style.strokeDasharray = null
  }, time/2)

  if (clone) {
    timeout(() => {
      $newTrail && $newTrail.remove()
    }, time)
  }
}

const updateView = () => {
  $('#wood .value').innerText = resources.wood
  $('#food .value').innerText = resources.food

  $('#population .value').innerText = population.total
  $('#ready .value').innerText = Math.max(0, population.ready - population.starving)
  $('#starving .value').innerText = population.starving
  if (population.starving < 1) {
    undisplay('#starving')
  } else {
    display('#starving')
  }

  $('#fishers .value').innerText = population.fishers
  if (population.fishers > 1) {
    display('#fishers')
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
  const $shipTop = $('#ss')
  $shipTop.removeAttribute('transform') // Because Chrome is shit
  $('#sail').beginElement()
  $('#sink').beginElement()
  setTimeout(() => {
    hide('#ship')
    $shipTop.transform.baseVal.appendItem($shipTop.transform.baseVal.createSVGTransformFromMatrix($('#island').createSVGMatrix()))
    $shipTop.transform.baseVal.appendItem($shipTop.transform.baseVal.createSVGTransformFromMatrix($('#island').createSVGMatrix()))
    $shipTop.transform.baseVal.getItem(1).setScale(-1, 1);
    $shipTop.transform.baseVal.getItem(0).setTranslate(-20,0);
  }, $('#sink').getSimpleDuration() * 790) // 800 minus a little less because timers are unreliable
}