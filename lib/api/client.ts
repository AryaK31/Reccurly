import { Platform } from "react-native";
import Constants from "expo-constants";

const DEFAULT_PORT = 5500;
const API_PREFIX = "/api/v1";

// Pattern to detect localhost URLs
const LOOPBACK_HOST_PATTERN = /^https?:\/\/(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(:\d+)?(\/|$)/i;

// Pattern to detect IPv4 addresses
const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;

/**
 * Extract host from URI (e.g., "172.17.68.16" from "http://172.17.68.16:5500")
 */
const extractHost = (uri?: string | null): string | null => {
  if (!uri) return null;
  const trimmed = uri.trim();
  if (!trimmed) return null;

  const withoutScheme = trimmed.replace(/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//, "");
  const hostPort = withoutScheme.split("/")[0] ?? "";
  const host = hostPort.split(":")[0] ?? "";
  return host || null;
};

/**
 * Check if host is an IPv4 address
 */
const isIpv4Host = (host?: string | null): boolean =>
  Boolean(host && IPV4_PATTERN.test(host));

/**
 * Get development machine IP from Expo constants
 */
const getDevHostIp = (): string | null => {
  const hosts = [
    extractHost(Constants.expoConfig?.hostUri),
    extractHost(Constants.linkingUri),
  ].filter(Boolean) as string[];

  const firstIp = hosts.find(
    (host) => isIpv4Host(host) && !host.startsWith("127.")
  );

  return firstIp ?? null;
};

/**
 * Resolve all possible API base URLs in priority order
 */
const resolveBaseUrls = (): string[] => {
  const devHostIp = getDevHostIp();
  const isExpoGo = Constants.executionEnvironment === "storeClient";
  const candidates: string[] = [];

  // 1. Explicit environment variable (highest priority)
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envBaseUrl) {
    const normalized = envBaseUrl.replace(/\/+$/, "");
    const isLoopback = LOOPBACK_HOST_PATTERN.test(normalized);

    // For Expo Go physical device, replace localhost with dev machine IP
    if (isExpoGo && Platform.OS !== "web" && isLoopback && devHostIp) {
      candidates.push(`http://${devHostIp}:${DEFAULT_PORT}`);
    } else {
      candidates.push(normalized);
    }
  }

  // 2. Try development machine IP (Expo Go on physical device)
  if (devHostIp) {
    candidates.push(`http://${devHostIp}:${DEFAULT_PORT}`);
  }

  // 3. Android emulator special IP
  if (Platform.OS === "android") {
    candidates.push(`http://10.0.2.2:${DEFAULT_PORT}`);
  }

  // 4. Fallback to localhost
  candidates.push(`http://127.0.0.1:${DEFAULT_PORT}`);

  return Array.from(new Set(candidates));
};

const API_BASE_URLS = resolveBaseUrls();
let workingBaseUrl = API_BASE_URLS[0] ?? `http://127.0.0.1:${DEFAULT_PORT}`;

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  token?: string | null;
  headers?: Record<string, string>;
};

/**
 * Fetch with intelligent fallback across multiple API URLs
 */
const fetchWithFallback = async (
  path: string,
  init?: RequestInit
): Promise<Response> => {
  // Prioritize the last working URL, then try others
  const candidates = [
    workingBaseUrl,
    ...API_BASE_URLS.filter((url) => url !== workingBaseUrl),
  ];

  let lastError: unknown = null;

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        // Add timeout of 10 seconds per attempt
        signal: AbortSignal.timeout(10000),
      });

      // Remember which URL worked for next request
      workingBaseUrl = baseUrl;
      return response;
    } catch (error) {
      lastError = error;
      // Continue to next candidate if this one fails
      if (!(error instanceof TypeError)) {
        throw error;
      }
    }
  }

  // All candidates failed
  const attempted = candidates.join(", ");
  const reason =
    lastError instanceof Error ? lastError.message : "Unknown network error";
  throw new Error(
    `Network request failed for all API base URLs [${attempted}]. ${reason}`
  );
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const normalizedPath = path.startsWith(API_PREFIX)
    ? path
    : `${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  try {
    const response = await fetchWithFallback(normalizedPath, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    const json = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const errorMessage = json?.message || `API Error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return json as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`API Error [${options.method || 'GET'} ${normalizedPath}]:`, message);
    throw error;
  }
}
