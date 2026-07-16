const GITHUB_API = 'https://api.github.com'

async function ghFetch<T = unknown>(
  token: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? `GitHub API ${res.status}`)
  }
  return res.json() as Promise<T>
}

export interface ParsedGitHubUrl {
  owner: string
  repo: string
  type: 'repo' | 'pr' | 'branch' | 'commit'
  ref: string
}

export function parseGitHubUrl(url: string): ParsedGitHubUrl | null {
  try {
    const u = new URL(url.trim())
    if (u.hostname !== 'github.com') return null
    const parts = u.pathname.replace(/^\//, '').split('/')
    if (parts.length < 2) return null
    const [owner, repo] = parts
    const clean = repo.replace(/\.git$/, '')

    if (parts.length === 2) return { owner, repo: clean, type: 'repo', ref: '' }
    const section = parts[2]
    if (section === 'pull' && parts[3]) return { owner, repo: clean, type: 'pr', ref: parts[3] }
    if (section === 'tree' && parts[3]) return { owner, repo: clean, type: 'branch', ref: parts.slice(3).join('/') }
    if (section === 'commit' && parts[3]) return { owner, repo: clean, type: 'commit', ref: parts[3] }
    return { owner, repo: clean, type: 'repo', ref: '' }
  } catch {
    return null
  }
}

export interface RepoInfo {
  full_name: string
  default_branch: string
  description: string | null
  private: boolean
  html_url: string
}

export async function validateRepo(token: string, owner: string, repo: string): Promise<RepoInfo> {
  return ghFetch<RepoInfo>(token, `/repos/${owner}/${repo}`)
}

export interface PRInfo {
  number: number
  title: string
  body: string | null
  state: string
  html_url: string
  head: { ref: string; sha: string }
  base: { ref: string }
  user: { login: string }
  created_at: string
  changed_files: number
  additions: number
  deletions: number
  mergeable: boolean | null
}

export async function getPRDetails(token: string, owner: string, repo: string, prNumber: string): Promise<PRInfo> {
  return ghFetch<PRInfo>(token, `/repos/${owner}/${repo}/pulls/${prNumber}`)
}

export interface PRFile {
  filename: string
  status: string
  additions: number
  deletions: number
  changes: number
}

export async function getPRFiles(token: string, owner: string, repo: string, prNumber: string): Promise<PRFile[]> {
  return ghFetch<PRFile[]>(token, `/repos/${owner}/${repo}/pulls/${prNumber}/files`)
}

export interface RefInfo {
  ref: string
  object: { sha: string }
}

async function getRef(token: string, owner: string, repo: string, branch: string): Promise<RefInfo> {
  return ghFetch<RefInfo>(token, `/repos/${owner}/${repo}/git/ref/heads/${branch}`)
}

export async function createBranch(
  token: string,
  owner: string,
  repo: string,
  newBranch: string,
  fromBranch: string,
): Promise<{ ref: string }> {
  const base = await getRef(token, owner, repo, fromBranch)
  return ghFetch(token, `/repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha: base.object.sha }),
  })
}

export interface FileInfo {
  sha: string
  content: string
}

async function getFileSha(
  token: string,
  owner: string,
  repo: string,
  path: string,
  branch: string,
): Promise<string | null> {
  try {
    const info = await ghFetch<FileInfo>(token, `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`)
    return info.sha
  } catch {
    return null
  }
}

export async function createOrUpdateFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string,
): Promise<{ commit: { sha: string; html_url: string } }> {
  const sha = await getFileSha(token, owner, repo, path, branch)
  const encoded = btoa(unescape(encodeURIComponent(content)))
  return ghFetch(token, `/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content: encoded, branch, ...(sha ? { sha } : {}) }),
  })
}

export interface CreatedPR {
  number: number
  html_url: string
  title: string
}

export async function createPullRequest(
  token: string,
  owner: string,
  repo: string,
  title: string,
  body: string,
  head: string,
  base: string,
): Promise<CreatedPR> {
  return ghFetch<CreatedPR>(token, `/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    body: JSON.stringify({ title, body, head, base, draft: false }),
  })
}
