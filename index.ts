export async function searchFile(path: string, phrase: string): Promise<boolean> {
  const file = Bun.file(path)
  const reader = file.stream().getReader()
  const chunkSize = phrase.length
  
  let previousChunk = new Uint8Array(0)
  let found = false

  while (!found) {
    const { done, value } = await reader.read()
    if (done) break;

    const currentChunk = value
    const combinedChunk = new Uint8Array(previousChunk.length + currentChunk.length)

    combinedChunk.set(previousChunk)
    combinedChunk.set(currentChunk, previousChunk.length)

    const decodedChunk = new TextDecoder().decode(combinedChunk)
    if (decodedChunk.includes(phrase)) {
      found = true
      break
    }

    previousChunk = currentChunk.slice(-chunkSize)
  }

  return found
}