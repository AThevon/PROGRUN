import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Set env vars before import
const ORIGINAL_ENV = process.env

beforeEach(() => {
  process.env = {
    ...ORIGINAL_ENV,
    STRAVA_CLIENT_ID: 'test-client-id',
    STRAVA_CLIENT_SECRET: 'test-client-secret',
  }
})

afterEach(() => {
  process.env = ORIGINAL_ENV
  vi.restoreAllMocks()
})

import {
  getStravaAuthorizeUrl,
  exchangeStravaCode,
  refreshStravaToken,
} from '@/lib/strava/oauth'

describe('getStravaAuthorizeUrl', () => {
  it('contient l\'URL de base Strava', () => {
    const result = getStravaAuthorizeUrl('http://localhost:3000/callback')
    expect(result.url).toContain('https://www.strava.com/oauth/authorize')
  })

  it('contient le client_id', () => {
    const result = getStravaAuthorizeUrl('http://localhost:3000/callback')
    expect(result.url).toContain('client_id=test-client-id')
  })

  it('contient le redirect_uri', () => {
    const result = getStravaAuthorizeUrl('http://localhost:3000/callback')
    expect(result.url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback')
  })

  it('contient response_type=code', () => {
    const result = getStravaAuthorizeUrl('http://localhost:3000/callback')
    expect(result.url).toContain('response_type=code')
  })

  it('contient le scope requis', () => {
    const result = getStravaAuthorizeUrl('http://localhost:3000/callback')
    expect(result.url).toContain('scope=read')
    expect(result.url).toContain('activity%3Aread_all')
  })

  it('contient approval_prompt=auto', () => {
    const result = getStravaAuthorizeUrl('http://localhost:3000/callback')
    expect(result.url).toContain('approval_prompt=auto')
  })

  it('retourne un state qui est un UUID', () => {
    const result = getStravaAuthorizeUrl('http://localhost:3000/callback')
    expect(result.state).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
  })
})

describe('exchangeStravaCode', () => {
  it('appelle fetch avec les bons paramètres et retourne le token', async () => {
    const mockResponse = {
      access_token: 'abc123',
      refresh_token: 'ref456',
      expires_at: 1700000000,
      athlete: { id: 42, firstname: 'John', lastname: 'Doe' },
    }

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    )

    const result = await exchangeStravaCode('auth-code', 'http://localhost:3000/callback')

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://www.strava.com/oauth/token',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: 'test-client-id',
          client_secret: 'test-client-secret',
          code: 'auth-code',
          grant_type: 'authorization_code',
        }),
      })
    )

    expect(result.access_token).toBe('abc123')
    expect(result.refresh_token).toBe('ref456')
    expect(result.athlete.id).toBe(42)
  })

  it('lance une erreur quand la réponse est en échec', async () => {
    const errorBody = { message: 'Bad Request', errors: [] }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(errorBody), { status: 400 })
    )

    await expect(
      exchangeStravaCode('bad-code', 'http://localhost:3000/callback')
    ).rejects.toThrow('Strava token exchange failed (400)')
  })
})

describe('refreshStravaToken', () => {
  it('appelle fetch avec grant_type=refresh_token et retourne le nouveau token', async () => {
    const mockResponse = {
      access_token: 'new-access',
      refresh_token: 'new-refresh',
      expires_at: 1700001000,
    }

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    )

    const result = await refreshStravaToken('old-refresh-token')

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://www.strava.com/oauth/token',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          client_id: 'test-client-id',
          client_secret: 'test-client-secret',
          refresh_token: 'old-refresh-token',
          grant_type: 'refresh_token',
        }),
      })
    )

    expect(result.access_token).toBe('new-access')
    expect(result.refresh_token).toBe('new-refresh')
  })

  it('lance une erreur quand la réponse est en échec', async () => {
    const errorBody = { message: 'Unauthorized' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(errorBody), { status: 401 })
    )

    await expect(
      refreshStravaToken('expired-token')
    ).rejects.toThrow('Strava token refresh failed (401)')
  })
})
