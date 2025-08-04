import { Radio } from './radio.js'
import * as player from './player.js'

const radio = new Radio()
radio.addListener("station-changed", (_, station) => {
    if (station.label === 'About') {
        player.loadAudioFiles()
    }
})
window.addEventListener("load", () => radio.loadStationFromHash());
window.addEventListener("popstate", () => radio.loadStationFromHash());
