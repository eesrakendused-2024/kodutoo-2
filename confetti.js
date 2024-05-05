const canvas = document.getElementById('custom_canvas')
const button = document.getElementById('myBtn')

const jsConfetti = new JSConfetti({ canvas })

button.addEventListener('click', () => {
  jsConfetti.addConfetti()
})