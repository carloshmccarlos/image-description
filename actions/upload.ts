'use server'

import { PutObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2, BUCKET_NAME } from '@/lib/r2'
import { v4 as uuidv4 } from 'uuid'

/**
 * Helper to normalize R2 domain URL
 */
function getPublicDomain () {
  let domain = process.env.R2_PUBLIC_DOMAIN || ''
  if (domain.endsWith('/')) {
    domain = domain.slice(0, -1)
  }
  if (!domain.startsWith('http')) {
    domain = `https://${domain}`
  }
  return domain
}

/**
 * Upload a file to R2 temp storage
 * Files are stored in temp/ until explicitly saved
 */
export async function uploadToR2 (formData: FormData) {
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

  const domain = getPublicDomain()
  const publicUrl = `${domain}/${key}`
  return { url: publicUrl, key }
}

/**
 * Move an image from temp/ to saved/ in R2
 * Called when user saves a lesson to their history
 */
export async function promoteImageToSaved (tempUrl: string) {
  // Extract the key from the URL (format: https://.../temp/uuid.ext)
  const urlParts = tempUrl.split('/')
  const fileName = urlParts[urlParts.length - 1]
  const tempKey = `temp/${fileName}`
  const savedKey = `saved/${fileName}`

  try {
    // Copy to new location
    await r2.send(
      new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${tempKey}`,
        Key: savedKey
      })
    )

    // Delete the temp object
    await r2.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: tempKey
      })
    )

    const domain = getPublicDomain()
    return `${domain}/${savedKey}`
  } catch (error) {
    console.error('Failed to promote image:', error)
    // If promotion fails, return the original URL
    return tempUrl
  }
}

/**
 * Delete an image from R2 storage
 */
export async function deleteImage (imageUrl: string) {
  const urlParts = imageUrl.split('/')
  let key = ''

  // Determine the key based on URL path
  if (imageUrl.includes('/temp/')) {
    key = `temp/${urlParts[urlParts.length - 1]}`
  } else if (imageUrl.includes('/saved/')) {
    key = `saved/${urlParts[urlParts.length - 1]}`
  }

  if (!key) return { success: false }

  try {
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
