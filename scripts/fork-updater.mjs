#!/usr/bin/env node
/**
 * Fork-local updater manifest generator.
 *
 * Upstream's scripts/updater.mjs builds the `updater` release from
 * `repos.getLatestRelease()`, which this fork does not have — the fork only
 * publishes the rolling `autobuild` prerelease (and the API returns 404 when
 * every release is a prerelease). Running `pnpm updater` here therefore does
 * nothing, and the in-app updater pointed at
 * `releases/download/updater/update.json` gets a 404.
 *
 * This script builds the same two manifest files from the `autobuild` release:
 *   update.json       — asset URLs as published by GitHub
 *   update-proxy.json — the same URLs behind the update.hwdns.net proxy
 * and uploads both to the `updater` release. Asset URLs use
 * browser_download_url (github.com/.../releases/download/...), NOT the
 * api.github.com asset endpoints that the tauri-action generated latest.json
 * contains: those answer a plain GET with JSON metadata instead of the bundle.
 *
 * Runs on plain Node (global fetch), no dependencies.
 *
 * Env: GITHUB_TOKEN (required), GITHUB_REPOSITORY (owner/repo),
 *      FORK_BUILD_TAG (default autobuild), FORK_PROXY_PREFIX.
 */

const REPO = process.env.GITHUB_REPOSITORY || 'koval-alexander/clash-verge-rev'
const TOKEN = process.env.GITHUB_TOKEN
const SRC_TAG = process.env.FORK_BUILD_TAG || 'autobuild'
const DEST_TAG = 'updater'
const PROXY_PREFIX = process.env.FORK_PROXY_PREFIX || 'https://update.hwdns.net/'
const API = 'https://api.github.com'
const UPLOAD_API = 'https://uploads.github.com'

if (!TOKEN) {
  console.error('❌ GITHUB_TOKEN is required')
  process.exit(1)
}

const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'clash-verge-rev-fork-updater',
  'X-GitHub-Api-Version': '2022-11-28',
}

/** Every platform key the Tauri updater may ask for. */
const PLATFORM_KEYS = [
  'darwin-x86_64', 'darwin-x86_64-app', 'darwin-aarch64', 'darwin-aarch64-app',
  'linux-x86', 'linux-x86-deb', 'linux-x86-rpm',
  'linux-x86_64', 'linux-x86_64-deb', 'linux-x86_64-rpm',
  'linux-i686', 'linux-i686-deb', 'linux-i686-rpm',
  'linux-aarch64', 'linux-aarch64-deb', 'linux-aarch64-rpm',
  'linux-armv7', 'linux-armv7-deb', 'linux-armv7-rpm',
  'windows-x86', 'windows-x86-nsis', 'windows-x86_64', 'windows-x86_64-nsis',
  'windows-aarch64', 'windows-aarch64-nsis', 'windows-i686', 'windows-i686-nsis',
]

// Order matters: the most specific suffix must be tested first
// (aarch64.app.tar.gz before .app.tar.gz, x64-setup.exe before x86-setup.exe).
const SUFFIX_MAP = [
  ['x64-setup.exe', ['windows-x86_64', 'windows-x86_64-nsis']],
  ['x86-setup.exe', ['windows-x86', 'windows-x86-nsis', 'windows-i686-nsis']],
  ['arm64-setup.exe', ['windows-aarch64', 'windows-aarch64-nsis']],
  ['aarch64.app.tar.gz', ['darwin-aarch64', 'darwin-aarch64-app']],
  ['.app.tar.gz', ['darwin-x86_64', 'darwin-x86_64-app']],
  ['amd64.deb', ['linux-x86_64', 'linux-x86_64-deb']],
  ['x86_64.rpm', ['linux-x86_64-rpm']],
  ['arm64.deb', ['linux-aarch64', 'linux-aarch64-deb']],
  ['aarch64.rpm', ['linux-aarch64-rpm']],
  ['i386.deb', ['linux-x86', 'linux-x86-deb', 'linux-i686', 'linux-i686-deb']],
  ['i386.rpm', ['linux-x86-rpm', 'linux-i686-rpm']],
  ['armhf.deb', ['linux-armv7', 'linux-armv7-deb']],
  ['armhfp.rpm', ['linux-armv7-rpm']],
]

function keysFor(name) {
  for (const [suffix, keys] of SUFFIX_MAP) {
    if (name.endsWith(suffix)) return keys
  }
  return null
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, { ...options, headers: { ...HEADERS, ...(options.headers || {}) } })
  return res
}

async function apiJson(path, options = {}) {
  const res = await api(path, options)
  if (!res.ok) throw new Error(`${options.method || 'GET'} ${path} -> ${res.status} ${await res.text()}`)
  return res.status === 204 ? null : res.json()
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'clash-verge-rev-fork-updater' } })
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`)
  return res.text()
}

async function ensureRelease(tag) {
  const res = await api(`/repos/${REPO}/releases/tags/${tag}`)
  if (res.ok) return res.json()
  if (res.status !== 404) throw new Error(`release lookup ${tag} -> ${res.status}`)
  console.log(`↻ releases/${tag} не найден — создаю`)
  return apiJson(`/repos/${REPO}/releases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tag_name: tag,
      name: 'Auto-update channel',
      body: 'Update manifests (update.json / update-proxy.json) for the fork builds.',
      prerelease: true,
    }),
  })
}

async function uploadAsset(releaseId, name, data) {
  const body = Buffer.from(data, 'utf8')
  const res = await fetch(
    `${UPLOAD_API}/repos/${REPO}/releases/${releaseId}/assets?name=${encodeURIComponent(name)}`,
    {
      method: 'POST',
      headers: { ...HEADERS, 'Content-Type': 'application/json', 'Content-Length': String(body.length) },
      body,
    },
  )
  if (!res.ok) throw new Error(`upload ${name} -> ${res.status} ${await res.text()}`)
  return res.json()
}

async function main() {
  const release = await apiJson(`/repos/${REPO}/releases/tags/${SRC_TAG}`)
  const assets = release.assets || []

  const manifestAsset = assets.find((a) => a.name === 'latest.json')
  let version = (release.name || '').replace(/^Clash Verge Rev /, '')
  let notes = release.body || ''
  let pubDate = release.published_at
  if (manifestAsset) {
    try {
      const built = JSON.parse(await fetchText(manifestAsset.browser_download_url))
      version = built.version || version
      notes = built.notes || notes
      pubDate = built.pub_date || pubDate
    } catch (err) {
      console.log(`⚠️ не удалось прочитать latest.json: ${err.message}`)
    }
  }

  const platforms = {}
  for (const key of PLATFORM_KEYS) platforms[key] = { signature: '', url: '' }

  for (const asset of assets) {
    if (asset.name === 'latest.json') continue
    const isSig = asset.name.endsWith('.sig')
    const base = isSig ? asset.name.slice(0, -'.sig'.length) : asset.name
    const keys = keysFor(base)
    if (!keys) continue
    if (isSig) {
      const signature = await fetchText(asset.browser_download_url)
      for (const key of keys) platforms[key].signature = signature
    } else {
      for (const key of keys) platforms[key].url = asset.browser_download_url
    }
  }

  // A platform is only usable when its bundle URL is known.
  for (const key of Object.keys(platforms)) {
    if (platforms[key].url && !platforms[key].signature) {
      console.log(`⚠️ ${key}: нет .sig рядом с бандлом — платформа отброшена`)
      delete platforms[key]
    } else if (!platforms[key].url) {
      delete platforms[key]
    }
  }

  const missing = PLATFORM_KEYS.filter((key) => !(key in platforms))
  if (!Object.keys(platforms).length) throw new Error('ни одного бандла не распознано')

  const update = {
    version,
    notes: `${notes}\n\n**[See More](https://github.com/${REPO}/releases/tag/${SRC_TAG})**`,
    pub_date: pubDate,
    platforms,
  }

  const proxied = JSON.parse(JSON.stringify(update))
  for (const value of Object.values(proxied.platforms)) {
    value.url = `${PROXY_PREFIX}${value.url}`
  }

  const dest = await ensureRelease(DEST_TAG)
  for (const asset of dest.assets || []) {
    if (asset.name === 'update.json' || asset.name === 'update-proxy.json') {
      await api(`/repos/${REPO}/releases/assets/${asset.id}`, { method: 'DELETE' })
      console.log(`− удалён старый ${asset.name}`)
    }
  }

  await uploadAsset(dest.id, 'update.json', JSON.stringify(update, null, 2))
  await uploadAsset(dest.id, 'update-proxy.json', JSON.stringify(proxied, null, 2))

  console.log(`✅ updater/${update.version}: ${Object.keys(platforms).length} платформ загружено`)
  if (missing.length) console.log(`   пропущены: ${missing.join(', ')}`)
}

main().catch((err) => {
  console.error(`❌ fork-updater: ${err.message}`)
  process.exit(1)
})
