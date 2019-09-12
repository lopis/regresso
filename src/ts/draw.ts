let trailCount = 0
var startTrail = (time, trailId, clone) => {
  var $trail = $(`#${trailId}`)
  var $newTrail = clone ? $trail.cloneNode() : $trail
  let id = trailId
  if (clone) {
    id = 'trail' + (++trailCount)
    $newTrail.id = id
    $trail.after($newTrail)
  }
  setTimeout(() => {
    var pathLength = Math.round($trail.getTotalLength())
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

var updateView = () => {
  $('#wood .value').innerText = resources.wood
  $('#food .value').innerText = resources.food

  $('#population .value').innerText = populationTotal
  $('#ready .value').innerText = Math.max(0, populationReady - populationStarving)
  $('#starving .value').innerText = populationStarving
  if (populationStarving < 1) {
    undisplay('#starving')
  } else {
    display('#starving')
  }

  $('#fishers .value').innerText = populationFishers
  if (populationFishers > 1) {
    display('#fishers')
  }

  $('#forage .return').innerText = foragingReturns
  
  $('#forage').disabled = !enoughPeople(1)
  $('#fetchWood').disabled = !enoughPeople(1)
  $('#hunt').disabled = !enoughPeople(2)
  $('#pray').disabled = !enoughPeople(1) || isPraying
}

var updateDate = () => {
  date.setDate(date.getDate() + 1)
  $('#days .value').innerText = `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`
}

var sinkBoatAnimation = () => {
  var $shipTop = $('#ss')
  $shipTop.removeAttribute('transform') // Because Chrome is shit
  $('#sail').beginElement()
  $('#sink').beginElement()
  
  setTimeout(() => {
    hide('#ship')
    $shipTop.transform.baseVal.appendItem($shipTop.transform.baseVal.createSVGTransformFromMatrix($('#island').createSVGMatrix()))
    $shipTop.transform.baseVal.appendItem($shipTop.transform.baseVal.createSVGTransformFromMatrix($('#island').createSVGMatrix()))
    $shipTop.transform.baseVal.getItem(1).setScale(-1, 1);
    $shipTop.transform.baseVal.getItem(0).setTranslate(-20,0);
  }, ($('#sink').getSimpleDuration() - 2) * 990) // Duration minus a little less because timers are unreliable
}