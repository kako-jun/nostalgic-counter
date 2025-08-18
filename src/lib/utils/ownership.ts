import { getRedis } from '@/lib/core/db'
import { hashToken } from '@/lib/core/auth'
import { getRedisKeys } from '@/lib/utils/redis-keys'

/**
 * Interface for service lookup function
 */
export interface ServiceLookup {
  id: string
  url: string
}

/**
 * Verifies ownership of a service by URL and token
 */
export async function verifyServiceOwnership(
  service: string,
  url: string,
  token: string,
  getServiceByUrl: (url: string) => Promise<ServiceLookup | null>
): Promise<boolean> {
  const redis = getRedis()
  const keys = getRedisKeys(service)

  // Get service by URL
  const serviceData = await getServiceByUrl(url)
  if (!serviceData) {
    return false
  }

  // Get stored owner token hash
  const storedHash = await redis.get(keys.owner(serviceData.id))
  if (!storedHash) {
    return false
  }

  // Verify token
  const tokenHash = hashToken(token)
  return tokenHash === storedHash
}

/**
 * Creates ownership verification function for a specific service
 */
export function createOwnershipVerifier(
  service: string,
  getServiceByUrl: (url: string) => Promise<ServiceLookup | null>
) {
  return async (url: string, token: string): Promise<boolean> => {
    return verifyServiceOwnership(service, url, token, getServiceByUrl)
  }
}

/**
 * Sets ownership for a service
 */
export async function setServiceOwnership(
  service: string,
  id: string,
  token: string
): Promise<void> {
  const redis = getRedis()
  const keys = getRedisKeys(service)
  const tokenHash = hashToken(token)
  
  await redis.set(keys.owner(id), tokenHash)
}

/**
 * Removes ownership for a service
 */
export async function removeServiceOwnership(
  service: string,
  id: string
): Promise<void> {
  const redis = getRedis()
  const keys = getRedisKeys(service)
  
  await redis.del(keys.owner(id))
}

/**
 * Checks if a service has an owner
 */
export async function hasOwner(
  service: string,
  id: string
): Promise<boolean> {
  const redis = getRedis()
  const keys = getRedisKeys(service)
  
  const ownerHash = await redis.get(keys.owner(id))
  return ownerHash !== null
}

/**
 * Updates service ownership (changes owner token)
 */
export async function updateServiceOwnership(
  service: string,
  url: string,
  currentToken: string,
  newToken: string,
  getServiceByUrl: (url: string) => Promise<ServiceLookup | null>
): Promise<boolean> {
  // Verify current ownership
  const isCurrentOwner = await verifyServiceOwnership(
    service,
    url,
    currentToken,
    getServiceByUrl
  )
  
  if (!isCurrentOwner) {
    return false
  }

  // Get service data
  const serviceData = await getServiceByUrl(url)
  if (!serviceData) {
    return false
  }

  // Set new ownership
  await setServiceOwnership(service, serviceData.id, newToken)
  return true
}

/**
 * Ownership management utility class
 */
export class OwnershipManager {
  constructor(
    private service: string,
    private getServiceByUrl: (url: string) => Promise<ServiceLookup | null>
  ) {}

  /**
   * Verify ownership
   */
  async verify(url: string, token: string): Promise<boolean> {
    return verifyServiceOwnership(this.service, url, token, this.getServiceByUrl)
  }

  /**
   * Set ownership
   */
  async set(id: string, token: string): Promise<void> {
    return setServiceOwnership(this.service, id, token)
  }

  /**
   * Remove ownership
   */
  async remove(id: string): Promise<void> {
    return removeServiceOwnership(this.service, id)
  }

  /**
   * Check if service has owner
   */
  async hasOwner(id: string): Promise<boolean> {
    return hasOwner(this.service, id)
  }

  /**
   * Update ownership
   */
  async update(url: string, currentToken: string, newToken: string): Promise<boolean> {
    return updateServiceOwnership(
      this.service,
      url,
      currentToken,
      newToken,
      this.getServiceByUrl
    )
  }
}

/**
 * Creates an ownership manager for a specific service
 */
export function createOwnershipManager(
  service: string,
  getServiceByUrl: (url: string) => Promise<ServiceLookup | null>
): OwnershipManager {
  return new OwnershipManager(service, getServiceByUrl)
}