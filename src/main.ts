import { Radio } from './radio'
import * as player from './player'

const radio = new Radio()
radio.addListener("station-changed", (_, station) => {
    if (station.label === 'About') {
        player.loadAudioFiles()
    }
})
window.addEventListener("load", () => radio.loadStationFromHash());
window.addEventListener("popstate", () => radio.loadStationFromHash());
