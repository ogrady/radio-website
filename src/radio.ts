import * as marked from 'marked'
import welcomeMd from './content/welcome.md?raw'
import contactMd from './content/contact.md?raw'
import projectsMd from './content/projects.md?raw'
import aboutMd from './content/about.md?raw'

export const stations = [
  { label: 'Welcome', content: await marked.parse(welcomeMd) },
  { label: 'Projects', content: await marked.parse(projectsMd) },
  { label: 'Contact', content: await marked.parse(contactMd) },
  { label: 'About', content: await marked.parse(aboutMd) },
]

const degreePerStation = 360 / stations.length

let currentStation = 0
let currentRotation = 0

export function setupRadio() {
  const speaker = document.getElementById('radio-speaker')!
  const knob = document.getElementById('radio-knob')!
  const indicator = document.getElementById('wave-indicator')!
  const waveBand = document.querySelector('.wave-band') as HTMLElement

  const updateDisplay = () => {
    // Animate speaker text
    speaker.style.opacity = '0.9'
    setTimeout(() => {
      speaker.innerHTML = stations[currentStation].content
      speaker.style.opacity = '1'
    }, 150)



    // Animate indicator position
    const percent = currentStation / (stations.length - 1)
    const left = padding + percent * usableWidth
    indicator.style.left = `${left}px`
  }

  const setStation = (index: number) => {
    console.log("station", index)
    currentStation = index
    // Animate knob
    currentRotation = degreePerStation * index
    knob.style.transform = `rotate(${currentRotation}deg)`
    updateDisplay()
  }

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
    label.addEventListener('click', () => setStation(index))

    waveBand.appendChild(label)
  })

  knob.addEventListener('click', () => { console.log(42); setStation((currentStation + 1) % stations.length )})

  let isDragging = false
  let startX = 0
  let currentAngle = 0
  const totalStations = stations.length
  const minAngle = -180
  const maxAngle = 180
  const stepAngle = (maxAngle - minAngle) / (totalStations - 1)

  knob.addEventListener('mousedown', (e) => {
    isDragging = true
    startX = e.clientX
    document.body.style.cursor = 'grabbing'
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    const dx = e.clientX - startX
    let newAngle = currentAngle + dx * 0.5 // drag sensitivity
    newAngle = Math.max(minAngle, Math.min(maxAngle, newAngle))
    knob.style.transform = `rotate(${newAngle}deg)`
    console.log("angle", newAngle)
  })

  document.addEventListener('mouseup', () => {
    if (!isDragging) return
    isDragging = false
    document.body.style.cursor = 'default'

    // Snap to nearest station
    const relativeAngle = currentAngle
    const index = Math.round((relativeAngle - minAngle) / stepAngle)
    const snappedAngle = minAngle + index * stepAngle
    knob.style.transform = `rotate(${snappedAngle}deg)`
    currentAngle = snappedAngle
    // Update station
    //setStation(index)
})

  updateDisplay()
}
