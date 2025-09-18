import { google } from 'googleapis';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const SECRET_KEY = process.env.SECRET_KEY!;
const COOKIE_NAME = 'gtok'; // token chiffré
const SCOPE = ['https://www.googleapis.com/auth/gmail.send'];

export function getOAuthClient() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

export function getAuthUrl() {
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPE,
  });
}

export async function saveTokenCookie(token: any) {
  const secret = new TextEncoder().encode(SECRET_KEY);
  const jwe = await new jose.CompactEncrypt(new TextEncoder().encode(JSON.stringify(token)))
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(secret);
  cookies().set(COOKIE_NAME, jwe, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });
}

export async function readTokenFromCookie(): Promise<any | null> {
  const c = cookies().get(COOKIE_NAME)?.value;
  if (!c) return null;
  try {
    const secret = new TextEncoder().encode(SECRET_KEY);
    const { plaintext } = await jose.compactDecrypt(c, secret);
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch {
    return null;
  }
}

export async function getAuthedGmail() {
  const token = await readTokenFromCookie();
  if (!token?.access_token && !token?.refresh_token) return null;
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(token);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  return { gmail, oauth2Client };
}

export function toBase64Url(input: string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'');
}
