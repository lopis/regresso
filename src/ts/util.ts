const $ = q => document.querySelector(q)
const on = (elem, event, callback) => elem.addEventListener(event, callback)
const $$ = (tag, className, innerText) => {
  const el = document.createElement(tag)
  el.classList.add(className)
  el.innerText = innerText
  
  return el
}

const log = (text, color, emoji) => {
  if ($('#log .new')) {
    setTimeout(() => log(text, color, emoji), 500)
    return
  }

  const newLog = document.createElement('p')
  newLog.innerHTML = `<span class="icon">${emoji}</span><span class="${color}">${text}</span>`
  if (color) newLog.classList.add(color)
  newLog.classList.add('new')
  $('#log').prepend(newLog)
  setTimeout(() => {
    newLog.classList.remove('new')
  }, 200)
}