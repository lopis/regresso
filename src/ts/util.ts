const $ = q => document.querySelector(q)
const on = (elem, event, callback) => elem.addEventListener(event, callback)
const $$ = (tag, className, innerText) => {
  const el = document.createElement(tag)
  el.classList.add(className)
  el.innerText = innerText
  
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
  setTimeout(() => {
    newLog.classList.remove('new')
  }, 200)
}

const show = (q) => {
  $(q).style.visibility = 'visible'
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