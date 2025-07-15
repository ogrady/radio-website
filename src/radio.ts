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
  const stationIndicators = document.querySelector('.station-indicators') as HTMLElement

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

  const containerRect = knob.getBoundingClientRect();
  const innerRect = stationIndicators.getBoundingClientRect();

  const offsetX = (knob.clientWidth - knob.offsetWidth) / 2;
  const offsetY = (knob.clientHeight - knob.offsetHeight) / 2;

  stationIndicators.style.left = `${offsetX}px`;
  stationIndicators.style.top = `${offsetY}px`;


  let isDragging = false
  let start = {x:0,y:0}
  //let currentAngle = 0
  const totalStations = stations.length
  const minAngle = -180
  const maxAngle = 180
  //const stepAngle = (maxAngle - minAngle) / (totalStations - 1)


for (let i = 0; i < totalStations; i++) {
  const tick = document.createElement('div');
  tick.classList.add('station-tick');

  const angle = minAngle + (i * (maxAngle - minAngle)) / (totalStations - 1);
  tick.style.transform = `rotate(${angle}deg) translateY(-60px)`; // outside knob
  //stationIndicators.appendChild(tick);
}

  knob.addEventListener('mousedown', (e) => {
    isDragging = true
    start = {x: e.clientX, y: e.clientY}
    document.body.style.cursor = 'grabbing'
  })

  function getAngleFromMouse(event: MouseEvent) {
    const rect = knob.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI); // convert radians to degrees
    angle = angle - 90; // make top = 0 deg
    if (angle < -180) angle += 360;

    return angle;
  }

  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    const angle = getAngleFromMouse(e);
    const clamped = Math.max(minAngle, Math.min(maxAngle, angle));
    const index = Math.floor((clamped - minAngle) / degreePerStation);
    setStation(index)
  })

  document.addEventListener('mouseup', (e) => {
    if (!isDragging) return
    isDragging = false
    if (e.clientX === start.x && e.clientY === start.y) {
      // "click". Don't use click handler, or we will handle the event twice
      setStation((currentStation + 1) % stations.length )
    } else {
      document.body.style.cursor = 'default'
    }
})

  updateDisplay()
}
