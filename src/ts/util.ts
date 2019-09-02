const $ = q => document.querySelector(q)
const $a = q => document.querySelectorAll(q)
const on = (elem, event, callback) => elem.addEventListener(event, callback)
const $$ = (tag, className, innerText) => {
  const el = document.createElement(tag)
  el.classList.add(className)
  el.innerText = innerText
  
  return el
}

const log = (text, color, emoji, type) => {
  if ($(`.log#${type} .new`)) {
    timeout(() => log(text, color, emoji, type), 500)
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

  timeout(() => {
    newLog.classList.remove('new')
  }, 200)
}

const show = (q) => {
  $(q).style.visibility = 'visible'
}
const hide = (q) => {
  $(q).style.visibility = 'hidden'
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

const timeouts = []
const timeout = (fn, dur) => {
  timeouts.push(setTimeout(fn, dur))
}

const intervals = []
const interval = (fn, dur) => {
  intervals.push(setInterval(fn, dur))
}

const clearAllTimers = () => {
  timeouts.forEach(clearTimeout)
  intervals.forEach(clearInterval)
  clearInterval(dayInterval);
  clearInterval(dayCycleInterval);
}

const resetGame = () => {
  clearAllTimers()
  document.body.style.setProperty('--v', '0'); //Hide village
  $a('button').forEach(b => b.style.visibility = 'hidden')
  $a('.project').forEach(p => p.remove())
  $('#island').innerHTML = svgBackup
  $a('.log').forEach(l => l.innerHTML = '')

  for (const key in initialConditions) {
    if (initialConditions[key] instanceof Object) {
      Object.assign(window[key], initialConditions[key])
    } else {
      window[key] = initialConditions[key]
    }
  }
}