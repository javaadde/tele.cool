/**
 * TeleCool Throttling Download Engine (Core Logic)
 * This is a conceptual implementation of how the browser-based 
 * throttling would work using TransformStreams.
 */

export class DownloadThrottler extends TransformStream {
  private bytesPerSecond: number | null;
  private lastTime: number = Date.now();
  private bytesProcessedThisSecond: number = 0;

  constructor(bytesPerSecond: number | null) {
    super({
      transform: async (chunk, controller) => {
        if (!this.bytesPerSecond) {
          controller.enqueue(chunk);
          return;
        }

        const currentTime = Date.now();
        const timePassed = currentTime - this.lastTime;

        if (timePassed < 1000) {
          if (this.bytesProcessedThisSecond + chunk.length > this.bytesPerSecond) {
            // Need to wait until next second
            const delay = 1000 - timePassed;
            await new Promise(resolve => setTimeout(resolve, delay));
            this.lastTime = Date.now();
            this.bytesProcessedThisSecond = 0;
          }
        } else {
          this.lastTime = currentTime;
          this.bytesProcessedThisSecond = 0;
        }

        this.bytesProcessedThisSecond += chunk.length;
        controller.enqueue(chunk);
      }
    });
    this.bytesPerSecond = bytesPerSecond;
  }
}

/**
 * Initiates a download with a destination picker and throttling
 */
export async function startThrottledDownload(url: string, fileName: string, speedLimit: number | null) {
  // 1. Pick destination (File System Access API)
  // @ts-ignore - window.showSaveFilePicker is experimental
  if (!window.showSaveFilePicker) {
     window.location.href = url; // Fallback
     return;
  }

  try {
    const handle = await (window as any).showSaveFilePicker({
      suggestedName: fileName,
    });
    
    const response = await fetch(url);
    const body = response.body;

    if (!body) return;

    const throttler = new DownloadThrottler(speedLimit);
    const writable = await handle.createWritable();

    await body.pipeThrough(throttler).pipeTo(writable);
    
    console.log('Download complete');
  } catch (err) {
    console.error('Download cancelled or failed', err);
  }
}
