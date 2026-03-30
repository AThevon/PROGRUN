import crypto from "crypto";

const REQUEST_TOKEN_URL =
  "https://connectapi.garmin.com/oauth-service/oauth/request_token";
const AUTHORIZE_URL = "https://connect.garmin.com/oauthConfirm";
const ACCESS_TOKEN_URL =
  "https://connectapi.garmin.com/oauth-service/oauth/access_token";

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A");
}

function generateNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

function buildBaseString(
  method: string,
  url: string,
  params: Record<string, string>
): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(params[k])}`)
    .join("&");
  return [method.toUpperCase(), percentEncode(url), percentEncode(sorted)].join(
    "&"
  );
}

function buildSigningKey(consumerSecret: string, tokenSecret = ""): string {
  return `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
}

function buildSignature(baseString: string, signingKey: string): string {
  return crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");
}

function buildAuthHeader(params: Record<string, string>): string {
  const parts = Object.keys(params)
    .filter((k) => k.startsWith("oauth_"))
    .sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(params[k])}"`)
    .join(", ");
  return `OAuth ${parts}`;
}

export interface RequestTokenResult {
  oauthToken: string;
  oauthTokenSecret: string;
}

export interface AccessTokenResult {
  oauthToken: string;
  oauthTokenSecret: string;
  garminUserId?: string;
}

export async function getRequestToken(): Promise<RequestTokenResult> {
  const consumerKey = process.env.GARMIN_CONSUMER_KEY ?? "";
  const consumerSecret = process.env.GARMIN_CONSUMER_SECRET ?? "";

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateNonce(),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
  };

  const baseString = buildBaseString("POST", REQUEST_TOKEN_URL, oauthParams);
  const signingKey = buildSigningKey(consumerSecret);
  oauthParams.oauth_signature = buildSignature(baseString, signingKey);

  const authHeader = buildAuthHeader(oauthParams);

  const resp = await fetch(REQUEST_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: authHeader,
    },
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Garmin request token failed: ${resp.status} ${body}`);
  }

  const text = await resp.text();
  const params = new URLSearchParams(text);
  const oauthToken = params.get("oauth_token") ?? "";
  const oauthTokenSecret = params.get("oauth_token_secret") ?? "";

  return { oauthToken, oauthTokenSecret };
}

export function getAuthorizeUrl(oauthToken: string): string {
  return `${AUTHORIZE_URL}?oauth_token=${encodeURIComponent(oauthToken)}`;
}

export async function getAccessToken(
  oauthToken: string,
  oauthTokenSecret: string,
  oauthVerifier: string
): Promise<AccessTokenResult> {
  const consumerKey = process.env.GARMIN_CONSUMER_KEY ?? "";
  const consumerSecret = process.env.GARMIN_CONSUMER_SECRET ?? "";

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateNonce(),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: oauthToken,
    oauth_verifier: oauthVerifier,
    oauth_version: "1.0",
  };

  const baseString = buildBaseString("POST", ACCESS_TOKEN_URL, oauthParams);
  const signingKey = buildSigningKey(consumerSecret, oauthTokenSecret);
  oauthParams.oauth_signature = buildSignature(baseString, signingKey);

  const authHeader = buildAuthHeader(oauthParams);

  const resp = await fetch(ACCESS_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: authHeader,
    },
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Garmin access token failed: ${resp.status} ${body}`);
  }

  const text = await resp.text();
  const params = new URLSearchParams(text);

  return {
    oauthToken: params.get("oauth_token") ?? "",
    oauthTokenSecret: params.get("oauth_token_secret") ?? "",
    garminUserId: params.get("user_id") ?? undefined,
  };
}
