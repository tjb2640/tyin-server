import { Request, Response } from 'express'
import { PaginatedData } from '../common/types'
import { optional } from './Utils.utils'

export function respondWithValidationError(res: Response, body?: string): void {
    res.status(422).send(`${body}`)
    res.end()
}

export function itemsToPaginatedData<T>(req: Request, items: T[], itemsPerPage: number, totalItems: number): PaginatedData<T> {
    
    return {
        currentPage: parseInt(optional(req.query.page, 1), 10),
        totalPages: Math.ceil(totalItems / itemsPerPage),
        totalItems: totalItems,
        itemsPerPage: itemsPerPage,
        items: items
    } as PaginatedData<T>
}

/**
 * Returns the remote address of a Request.
 * If env->NGINX_USING_REVERSE_PROXY is true, it will return headers[x-forwarded-for] and connection.remoteAddress
 * instead of `req.ip`
 * @param req Express Request
 * @returns `string` ip
 */
export function getRemoteAddress(req: Request): string {
    if (process.env.NGINX_USING_REVERSE_PROXY !== 'true') {
        return req.ip
    }
    return (`${req.headers['x-forwarded-for']}` || req.connection.remoteAddress || '').split(',')[0]
}
