import { ISolBinList } from './types'
import {
  SOL_BIN_DOWNLOAD_PREFIX_PATH,
  SOL_BIN_FILE_NAME,
  SOL_BIN_VERSION_LIST_URL
} from './constant'
import fs from 'fs/promises'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'

const getSolBinList = async () => {
  const response = await fetch(SOL_BIN_VERSION_LIST_URL)
  if (response.status !== 200) {
    process.exit(1)
  }
  return response.json<ISolBinList>()
}

const downloadBin = async (url: string, fileName: string): Promise<void> => {
  console.log('Downloading from ' + url)

  const response = await fetch(url)

  if (!response.ok) {
    console.log('Download Failed')
    process.exit(1)
  }

  await fs.writeFile(fileName, await response.arrayBuffer())
}

const download = async () => {
  const binList = await getSolBinList()

  const latestRelease = binList.latestRelease
  const commitPath = binList.releases[latestRelease]

  const targetHash = binList.builds.filter(
    (build) => build.path === commitPath
  )[0].sha256

  const downloadURL = SOL_BIN_DOWNLOAD_PREFIX_PATH + commitPath

  await downloadBin(downloadURL, SOL_BIN_FILE_NAME)
  console.log('Download finished')

  const content = await fs.readFile(SOL_BIN_FILE_NAME, { encoding: 'binary' })
  const hash = '0x' + bytesToHex(sha256(content))

  if (hash !== targetHash) {
    console.log(
      `Sha256 hash mismatch: \n target hash is ${targetHash}, but got ${hash}`
    )
    process.exit(1)
  }
}

download()
