import * as marked from 'marked'
import welcomeMd from './content/welcome.md?raw'
import contactMd from './content/contact.md?raw'
import projectsMd from './content/projects.md?raw'
import aboutMd from './content/about.md?raw'


export const stations = [
  { label: 'Welcome', content: marked.parse(welcomeMd) },
  { label: 'Projects', content: marked.parse(projectsMd) },
  { label: 'Contact', content: marked.parse(contactMd) },
  { label: 'About', content: marked.parse(aboutMd) },
]

let currentStation = 0
let currentRotation = 0

export function setupRadio() {
  const speaker = document.getElementById('radio-speaker')!
  const knob = document.getElementById('radio-knob')!
  const indicator = document.getElementById('wave-indicator')!
  const waveBand = document.querySelector('.wave-band') as HTMLElement

  // Cleanup old labels if re-run
  document.querySelectorAll('.wave-label').forEach(el => el.remove())

  const bandWidth = waveBand.offsetWidth
  const padding = 60 // matches .wave-band padding
  const usableWidth = bandWidth - 2 * padding

  // Create labels
  stations.forEach((station, index) => {
    const label = document.createElement('div')
    label.className = 'wave-label'
    const percent = index / (stations.length - 1)
    const left = padding + percent * usableWidth

    label.style.left = `${left}px`
    label.textContent = station.label

    // Make labels clickable
    label.style.cursor = 'pointer'
    label.addEventListener('click', () => {
      currentStation = index
      updateDisplay()
    })

    waveBand.appendChild(label)
  })

  

  const updateDisplay = () => {
    // Animate speaker text
    speaker.style.opacity = '0.9'
    setTimeout(() => {
      speaker.innerHTML = stations[currentStation].content
      speaker.style.opacity = '1'
    }, 150)

    // Animate knob
    currentRotation += 30
    knob.style.transform = `rotate(${currentRotation}deg)`

    // Animate indicator position
    const percent = currentStation / (stations.length - 1)
    const left = padding + percent * usableWidth
    indicator.style.left = `${left}px`
  }

  knob.addEventListener('click', () => {
    currentStation = (currentStation + 1) % stations.length
    updateDisplay()
  })

  updateDisplay()
}
