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