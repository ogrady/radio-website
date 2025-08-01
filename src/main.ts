import { Radio } from './radio'
import * as player from './player'

const radio = new Radio()
radio.addListener("station-changed", (_, station) => {
    if (station.label === 'About') {
        player.loadAudioFiles()
    }
})
//document.addEventListener("DOMContentLoaded", player.loadAudioFiles);