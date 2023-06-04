import { Request, Response } from 'express'
import { Types } from 'mongoose'

export interface _MongoId {
    _id?: Types.ObjectId
    guid?: string
    deleted: boolean
}

export interface EndpointData {
    method?: string
    handler: (req: Request, res: Response) => void
}

export interface PaginatedData<T> {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    items: T[]
}

export interface RateLimitInfo {
    count: number
    window: number
}

export interface RateLimitOptions {
    windowMs: number
    maxRequests: number
}
