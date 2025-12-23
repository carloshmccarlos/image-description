/**
 * Client-side image compression utility
 * Compresses an image to be under a target size (default 500KB)
 * while maintaining a reasonable aspect ratio and quality.
 */
export async function compressImage(file: File, maxSizeBytes: number = 500 * 1024): Promise<File> {
    // If the file is already smaller than the target, return it as is
    if (file.size <= maxSizeBytes) {
        return file
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                // Calculate the scaling factor to reduce resolution if it's massive
                // This also helps reduce token usage significantly
                const MAX_DIMENSION = 1600
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = (height / width) * MAX_DIMENSION
                        width = MAX_DIMENSION
                    } else {
                        width = (width / height) * MAX_DIMENSION
                        height = MAX_DIMENSION
                    }
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Canvas context failed'))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)

                // Start with a high quality and progressively reduce until size is met
                let quality = 0.9
                const step = 0.1

                const attemptCompression = (q: number) => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Compression failed'))
                                return
                            }

                            if (blob.size <= maxSizeBytes || q <= 0.2) {
                                // Conversion from blob back to File
                                const compressedFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now(),
                                })
                                resolve(compressedFile)
                            } else {
                                // Recurse with lower quality
                                attemptCompression(q - step)
                            }
                        },
                        'image/jpeg',
                        q
                    )
                }

                attemptCompression(quality)
            }
            img.onerror = () => reject(new Error('Image load failed'))
        }
        reader.onerror = () => reject(new Error('File reader failed'))
    })
}
