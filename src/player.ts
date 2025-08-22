export async function loadAudioFiles() {
  try {
    const response = await fetch("src/content/audio/manifest.json")
    if (!response.ok) throw new Error('missing audio file')
    const files = await response.json()

    const list = document.getElementById("audio-list")
    if (!list) throw new Error('could not find audio list element')
    const player = document.getElementById("audio-player") as HTMLAudioElement
    if (!player) throw new Error('could not find player element')

    list.innerHTML = ""
    for (const { file, title } of files) {
      const li = document.createElement("li")
      li.textContent = title
      li.addEventListener("click", () => {
        document.querySelectorAll("#audio-list li").forEach(el => el.classList.remove("active"))
        li.classList.add("active")
        player.src = `src/content/audio/${file}`
        player.play()
      })
      list.appendChild(li)
    }

  } catch (error) {
    console.error("Failed to load audio files:", error)
  }
}