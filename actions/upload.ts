'use server'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { r2, BUCKET_NAME } from '@/lib/r2'
import { v4 as uuidv4 } from 'uuid'

export async function uploadToR2(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) {
        throw new Error('No file provided')
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const extension = file.name.split('.').pop()
    const key = `temp/${uuidv4()}.${extension}`

    await r2.send(
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type
        })
    )

    let domain = process.env.R2_PUBLIC_DOMAIN || ''
    // Ensure domain doesn't end with a slash
    if (domain.endsWith('/')) {
        domain = domain.slice(0, -1)
    }
    // Ensure protocol is present
    if (!domain.startsWith('http')) {
        domain = `https://${domain}`
    }

    const publicUrl = `${domain}/${key}`
    return { url: publicUrl, key }
}

export async function promoteImageToSaved(tempUrl: string) {
    // Extract the key from the URL
    // URL format: https://.../temp/uuid.ext
    const urlParts = tempUrl.split('/')
    const fileName = urlParts[urlParts.length - 1]
    const tempKey = `temp/${fileName}`
    const savedKey = `saved/${fileName}`

    try {
        // 1. Copy the object to the new location
        const { CopyObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3')

        await r2.send(
            new CopyObjectCommand({
                Bucket: BUCKET_NAME,
                CopySource: `${BUCKET_NAME}/${tempKey}`,
                Key: savedKey
            })
        )

        // 2. Delete the temp object
        await r2.send(
            new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: tempKey
            })
        )

        let domain = process.env.R2_PUBLIC_DOMAIN || ''
        if (domain.endsWith('/')) domain = domain.slice(0, -1)
        if (!domain.startsWith('http')) domain = `https://${domain}`

        return `${domain}/${savedKey}`
    } catch (error) {
        console.error('Failed to promote image:', error)
        // If promotion fails (e.g. file already in saved/), just return the original or throw
        return tempUrl
    }
}

export async function deleteImage(imageUrl: string) {
    const urlParts = imageUrl.split('/')
    let key = ''

    // Find where the key starts (after the domain)
    if (imageUrl.includes('/temp/')) {
        key = `temp/${urlParts[urlParts.length - 1]}`
    } else if (imageUrl.includes('/saved/')) {
        key = `saved/${urlParts[urlParts.length - 1]}`
    }

    if (!key) return

    try {
        const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
        await r2.send(
            new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key
            })
        )
        return { success: true }
    } catch (error) {
        console.error('Failed to delete image:', error)
        return { success: false }
    }
}

