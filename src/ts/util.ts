const $ = q => document.querySelector(q)
const $a = q => document.querySelectorAll(q)
const on = (elem, event, callback) => elem.addEventListener(event, callback)
const $$ = (tag, className, innerHTML) => {
  const el = document.createElement(tag)
  el.classList.add(className)
  el.innerHTML = innerHTML
  
  return el
}

const log = (text, color, emoji, type) => {
  if ($(`.log#${type} .new`)) {
    setTimeout(() => log(text, color, emoji, type), 500)
    return
  }

  const newLog = document.createElement('p')
  newLog.innerHTML = `<span class="icon">${emoji}</span><span class="${color}">${text}</span>`
  if (color) newLog.classList.add(color)
  newLog.classList.add('new')
  $(`.log#${type}`).prepend(newLog)

  if (color === 'restart') {
    on(newLog, 'click', restart)
  }

  setTimeout(() => {
    newLog.classList.remove('new')
  }, 200)
}

const show = (q) => {
  $(q).style.visibility = 'visible'
}
const display = (q) => {
  $(q).classList.remove('hidden')
}
const undisplay = (q) => {
  $(q).classList.add('hidden')
}
const hide = (q) => {
  $(q).style.visibility = 'hidden'
}
const openModal = (name) => {
  show(`#${name}`)
  $('body').classList.add('blured')
}
const closeModal = (name) => {
  $(`#${name}`).classList.add('closed')
  $('body').classList.remove('blured')
}

const shuffle = (array) => {
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
const timeout = (fn, dur) => {
  timeouts.push(setTimeout(fn, dur))
}

let intervals = []
const interval = (fn, dur) => {
  intervals.push(setInterval(fn, dur))
}

const clearAllTimers = () => {
  timeouts.forEach(clearTimeout)
  timeouts = []
  intervals.forEach(clearInterval)
  intervals = []
  clearInterval(dayInterval);
  clearInterval(dayCycleInterval);
}

const resetGame = () => {
  clearAllTimers()
  document.body.style.setProperty('--v', '0'); //Hide village
  $a('.actions button').forEach(b => b.style.visibility = 'hidden')
  $a('.project').forEach(p => p.remove())
  $('#island').remove()
  // const animClone = $('#anims').cloneNode(true)
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