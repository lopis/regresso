var $ = q => document.querySelector(q)
var $a = q => document.querySelectorAll(q)
var on = (elem, event, callback) => elem.addEventListener(event, callback)
var $$ = (tag, className, innerHTML) => {
  var el = document.createElement(tag)
  el.classList.add(className)
  el.innerHTML = innerHTML
  
  return el
}

var log = (text, color, emoji, type) => {
  if ($(`.log#${type} .new`)) {
    setTimeout(() => log(text, color, emoji, type), 500)
    return
  }

  var newLog = $$('p', `new ${color}`, `<span class="icon">${emoji}</span><span class="${color}">${text}</span>`)

  newLog.classList.add('new')
  $(`.log#${type}`).prepend(newLog)

  if (color === 'restart') {
    on(newLog, 'click', restart)
  }

  setTimeout(() => {
    newLog.classList.remove('new')
  }, 200)
}

var show = (q) => {
  $(q).style.visibility = 'visible'
}
var display = (q) => {
  $(q).classList.remove('hidden')
}
var undisplay = (q) => {
  $(q).classList.add('hidden')
}
var hide = (q) => {
  $(q).style.visibility = 'hidden'
}
var openModal = (name) => {
  show(`#${name}`)
  $('body').classList.add('blured')
}
var closeModal = (name) => {
  $(`#${name}`).classList.add('closed')
  $('body').classList.remove('blured')
}

var shuffle = (array) => {
  let i = 0
    , j = 0
    , temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }

  return array
}

let timeouts = []
var timeout = (fn, dur) => {
  timeouts.push(setTimeout(fn, dur))
}

let intervals = []
var interval = (fn, dur) => {
  intervals.push(setInterval(fn, dur))
}

var clearAllTimers = () => {
  timeouts.forEach(clearTimeout)
  timeouts = []
  intervals.forEach(clearInterval)
  intervals = []
  clearInterval(dayInterval);
  clearInterval(dayCycleInterval);
}

var resetGame = () => {
  clearAllTimers()
  document.body.style.setProperty('--v', '0'); //Hide village
  $a('.actions button').forEach(b => b.style.visibility = 'hidden')
  $a('.project').forEach(p => p.remove())
  $('#island').remove()
  // var animClone = $('#anims').cloneNode(true)
  $('#main-image').append(svgBackup.cloneNode(true))
  // $('#main-image').append(animClone)
  $a('.log').forEach(l => l.innerHTML = '')
  $('#island').style.filter = null
  hide('#score-board')
  show('#ship')
  $('#ship').classList.remove('go')
  $('#ship').classList.remove('new')
  resetPeople()
  resetData()
}