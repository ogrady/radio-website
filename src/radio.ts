import * as marked from 'marked'
import { EventEmitter } from 'events'
import welcomeMd from './content/welcome.md?raw'
import contactMd from './content/contact.md?raw'
import projectsMd from './content/projects.md?raw'
import aboutMd from './content/about.md?raw'

const delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time))

export const stations = [
  { label: 'Welcome', content: await marked.parse(welcomeMd) },
  { label: 'Projects', content: await marked.parse(projectsMd) },
  { label: 'Contact', content: await marked.parse(contactMd) },
  { label: 'About', content: await marked.parse(aboutMd) },
].map(s => ({
  ...s,
  slug: s.label.toLowerCase() 
}))

console.log(stations)

const degreePerStation = 360 / stations.length
const minAngle = -180
const maxAngle = 180

function getAngleFromMouse(element: Element, event: MouseEvent) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;

  let angle = Math.atan2(dy, dx) * (180 / Math.PI); // convert radians to degrees
  angle = angle - 90; // make top = 0 deg
  if (angle < -180) angle += 360;

  return angle;
}

export class Radio extends EventEmitter {
  #currentStation = 0
  #currentRotation = 0
  #dragInfo: null | { x: number, y: number } = null

  get speaker () { return document.getElementById('radio-speaker') as HTMLElement }
  get knob () { return document.getElementById('radio-knob') as HTMLElement }
  get indicator () { return document.getElementById('wave-indicator') as HTMLElement }
  get waveBand () { return document.querySelector('.wave-band') as HTMLElement }
  get stationIndicators () { return document.querySelector('.station-indicators') as HTMLElement }

  constructor () {
    super()
    this.#init()
    this.#updateDisplay()
  }

  async #setStation(index: number) {
    this.#currentStation = index
    // Animate knob
    this.#currentRotation = degreePerStation * index
    this.knob.style.transform = `rotate(${this.#currentRotation}deg)`
    await this.#updateDisplay()
    history.pushState(null, "", `#${stations[index].slug}`);
    this.emit('station-changed', index, stations[index])
  }

  async #updateDisplay () {
    // Animate speaker text
    this.speaker.style.opacity = '0.9'
    await delay(150)
    this.speaker.innerHTML = stations[this.#currentStation].content
    this.speaker.style.opacity = '1'

    // Animate indicator position
    const bandWidth = this.waveBand.offsetWidth
    const padding = 60 // matches .wave-band padding
    const usableWidth = bandWidth - 2 * padding
    const percent = this.#currentStation / (stations.length - 1)
    const left = padding + percent * usableWidth
    this.indicator.style.left = `${left}px`

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
      label.addEventListener('click', () => this.#setStation(index))

      this.waveBand.appendChild(label)
    })
  }

  #init () {
    // Cleanup old labels if re-run
    document.querySelectorAll('.wave-label').forEach(el => el.remove())

    const offsetX = (this.knob.clientWidth - this.knob.offsetWidth) / 2;
    const offsetY = (this.knob.clientHeight - this.knob.offsetHeight) / 2;

    this.stationIndicators.style.left = `${offsetX}px`;
    this.stationIndicators.style.top = `${offsetY}px`;


    for (let i = 0; i < stations.length; i++) {
      const indicator = document.createElement('div');
      const angle = (360 / stations.length) * i;
      indicator.style.transform = `rotate(${angle}deg) translateY(-80px)`;
      this.stationIndicators.appendChild(indicator);
    }

    // Register listeners
    document.addEventListener('mousemove', e => {
      if (!this.#dragInfo) return
      const angle = getAngleFromMouse(this.knob, e);
      const clamped = Math.max(minAngle, Math.min(maxAngle, angle));
      const index = Math.floor((clamped - minAngle) / degreePerStation);
      this.#setStation(index)
    })

    this.knob.addEventListener('mousedown', (e) => {
      this.#dragInfo = {x: e.clientX, y: e.clientY}
      document.body.style.cursor = 'grabbing'
    })

    document.addEventListener('mouseup', e => {
      if (!this.#dragInfo) return
      if (e.clientX === this.#dragInfo.x && e.clientY === this.#dragInfo.y) {
        // "click". Don't use click handler, or we will handle the event twice
        this.#setStation((this.#currentStation + 1) % stations.length )
      } else {
        document.body.style.cursor = 'default'
      }
      this.#dragInfo = null
  })
  }

  async loadStationFromHash() {
    const hash = window.location.hash.replace("#", "")
    const index = stations.findIndex(station => station.slug === hash)
    await this.#setStation(index >= 0 ? index : 0)
  }
}
