const canvas = document.getElementById('custom_canvas')
const button = document.getElementById('myBtn')

const jsConfetti = new JSConfetti({ canvas })

//setTimeout(() => {
//  jsConfetti.addConfetti()
//}, 500)

button.addEventListener('click', () => {
  jsConfetti.addConfetti()
})