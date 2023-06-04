import { Request, Response, NextFunction } from 'express'
import { RateLimitInfo, RateLimitOptions } from '../common/types'
import { getRemoteAddress } from '../utils/Endpoint.utils'

// TODO: log all access attempts

/**
 * Middleware for rate limiting.
 * @param options 
 * @returns 
 */
export const rateLimiter = (options: RateLimitOptions) => {
    const rateInfo = new Map<String, RateLimitInfo>()

    return (req: Request, res: Response, next: NextFunction) => {
        const now = Date.now()
        Object.defineProperty(req, 'time', now)
        const remoteAddress = getRemoteAddress(req) // for reverse proxy compatibility

        const rateLimitInfo: RateLimitInfo | undefined = rateInfo.get(remoteAddress)
        const currentWindow = Math.floor(now / options.windowMs)

        if (rateLimitInfo === undefined) {
            rateInfo.set(remoteAddress, {
                window: currentWindow, 
                count: 1
            })
        } else if (rateLimitInfo.window != currentWindow) {
            rateLimitInfo.window = currentWindow
            rateLimitInfo.count = 1
        } else {
            if (++rateLimitInfo.count > options.maxRequests) {
                res.status(429).end()
                return
            }
        }
        next()
    }
}

export default rateLimiter
