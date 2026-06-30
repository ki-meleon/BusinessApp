import { createClient, type WebDAVClient } from 'webdav'

let cachedClient: WebDAVClient | null = null

function getClient(): WebDAVClient {
  if (cachedClient) return cachedClient
  const url = process.env.NEXTCLOUD_URL
  const username = process.env.NEXTCLOUD_USERNAME
  const password = process.env.NEXTCLOUD_APP_PASSWORD
  if (!url || !username || !password) {
    throw new Error('NEXTCLOUD_URL, NEXTCLOUD_USERNAME und NEXTCLOUD_APP_PASSWORD müssen gesetzt sein')
  }
  cachedClient = createClient(url, { username, password })
  return cachedClient
}

function baseFolder(): string {
  const folder = process.env.NEXTCLOUD_PPTX_FOLDER
  if (!folder) throw new Error('NEXTCLOUD_PPTX_FOLDER is not set')
  return folder
}

function topicsFolder(): string {
  return `${baseFolder()}/topics`
}

function generatedFolder(): string {
  return `${baseFolder()}/generated`
}

export async function ensureDirsExist(): Promise<void> {
  const client = getClient()
  for (const dir of [baseFolder(), topicsFolder(), generatedFolder()]) {
    if (!(await client.exists(dir))) {
      await client.createDirectory(dir, { recursive: true })
    }
  }
}

export function topicPptxRemotePath(topicId: string): string {
  return `${topicsFolder()}/${topicId}.pptx`
}

export function topicPptxRelativePath(topicId: string): string {
  return `topics/${topicId}.pptx`
}

export function generatedPptxRemotePath(filename: string): string {
  return `${generatedFolder()}/${filename}`
}

export async function uploadTopicPptx(topicId: string, buffer: Buffer): Promise<void> {
  await ensureDirsExist()
  await getClient().putFileContents(topicPptxRemotePath(topicId), buffer, { overwrite: true })
}

export async function topicPptxExists(topicId: string): Promise<boolean> {
  return getClient().exists(topicPptxRemotePath(topicId))
}

export async function deleteTopicPptx(topicId: string): Promise<void> {
  const client = getClient()
  const remotePath = topicPptxRemotePath(topicId)
  if (await client.exists(remotePath)) {
    await client.deleteFile(remotePath)
  }
}

export async function downloadTopicPptxToBuffer(topicId: string): Promise<Buffer> {
  const content = await getClient().getFileContents(topicPptxRemotePath(topicId), { format: 'binary' })
  return Buffer.from(content as ArrayBuffer)
}

export async function uploadGeneratedPptx(filename: string, buffer: Buffer): Promise<void> {
  await ensureDirsExist()
  await getClient().putFileContents(generatedPptxRemotePath(filename), buffer, { overwrite: true })
}

export async function downloadGeneratedPptxToBuffer(filename: string): Promise<Buffer> {
  const content = await getClient().getFileContents(generatedPptxRemotePath(filename), { format: 'binary' })
  return Buffer.from(content as ArrayBuffer)
}

export interface RemoteFile {
  filename: string
  lastModified: string
  sizeBytes: number
}

export async function listGeneratedPptx(): Promise<RemoteFile[]> {
  await ensureDirsExist()
  const entries = await getClient().getDirectoryContents(generatedFolder(), { details: false })
  return entries
    .filter((item) => item.type === 'file' && item.basename.endsWith('.pptx'))
    .map((item) => ({
      filename: item.basename,
      lastModified: new Date(item.lastmod).toISOString(),
      sizeBytes: item.size,
    }))
}
