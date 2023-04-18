import { Request, Response, Router } from 'express'
import { Item, ItemModel } from '../../models/Item.model'
import { itemsToPaginatedData } from '../../utils/Endpoint.utils'
import mongoose from 'mongoose'
import { TypeCode } from '../../models/TypeCode.model'
import { populateTypeCode } from '../../utils/TypeCode.utils'
import { optional } from '../../utils/Utils.utils'

class ItemController {
    private path: string = '/item'
    private router: Router

    constructor() {
        this.router = Router()
        this.initializeRouting()
    }

    public initializeRouting() {
        // Standard fetch, create (I'm calling this "import"), and soft delete endpoints
        this.router.get(this.path, async (req: Request, res: Response) => {
            await this.get_item_fetchAll(req, res)
        })
        this.router.get(`${this.path}/:guid`, async (req: Request, res: Response) => {
            await this.get_item_fetchOneByGuid(req, res)
        })
        this.router.post(this.path, this.post_item_importItem)
        this.router.delete(`${this.path}/:guid`, async (req: Request, res: Response) => {
            await this.delete_item_softDeleteByGuid(req, res)
        })

        // Only allow hard deletes if it's enabled in the config.
        if (process.env.ALLOW_HARD_DELETES) {
            this.router.delete(this.path, this.delete_item_deleteAll)
        }
    }
    
    public getRouter(): Router {
        return this.router
    }



    /**
     * `GET /apiv1/item` - fetch all item records
     * 
     * - `QUERY ?deleted=true` return deleted items only
     * - Accepts standard pagination params
     * @param req 
     * @param res 
     */
    public async get_item_fetchAll(req: Request, res: Response) {
        const itemCount = await ItemModel.count({
            deleted: false
        })
        const requestedPage: number = parseInt(optional(req.query.page, 1), 10)
        const itemsPerPage: number = parseInt(optional(req.query.itemsPerPage, process.env.PAGINATION_PAGESIZE, 10), 10)
        const itemOffset: number = itemsPerPage * (requestedPage - 1)

        // aggregate these documents for efficient pagination
        const crsr: mongoose.mongo.AggregationCursor<Item> = ItemModel.collection.aggregate([
            {
                "$match": {
                    "deleted": { "$eq" : req.query.deleted == "true" }
                },
            },
            { "$limit": itemOffset + itemsPerPage },
            { "$skip": itemOffset }
        ])
        const fetchedItems: Item[] = await crsr.toArray()
        crsr.close()
        res.send(itemsToPaginatedData(req, fetchedItems, itemsPerPage, itemCount))
    }

    /**
     * `GET /apiv1/item/{guid}` - fetch one item record with the specified `guid`
     * 
     * - `QUERY ?deleted=true` search deleted records
     * - `PARAM guid` - `guid` of the record to fetch
     * 
     * + `ERROR 404` if a record could not be found
     * @param req 
     * @param res 
     */
    public async get_item_fetchOneByGuid(req: Request, res: Response) {
        ItemModel.findOne({
            guid: req.params.guid,
            deleted: req.query.deleted == "true"
        })
        .setOptions({
            sanitizeFilter: true,
            sanitizeProjection: true
        })
        .then((item) => {
            if (item === null) {
                res.status(404).end()
            } else {
                res.send(item)
            }
        })
        .catch((err) => {
            console.error(err)
            res.status(500).end()
        })
    }

    /**
     * `DELETE /apiv1/item` - delete all items
     * 
     * Requires env->ALLOW_HARD_DELETES to be true
     * @param req 
     * @param res 
     */
    public async delete_item_deleteAll(req: Request, res: Response) {
        try {
            await ItemModel.deleteMany({})
            const items = await ItemModel.find()
            res.send(items)
        } catch (e) {
            res.status(500).end()
        }
    }

    public async delete_item_softDeleteByGuid(req: Request, res: Response) {
        ItemModel.findOne({
            guid: req.params.guid,
            deleted: false
        })
        .setOptions({
            sanitizeFilter: true,
            sanitizeProjection: true
        })
        .then((item) => {
            if (item === null) {
                res.status(404).end()
                return
            }

            // Soft-delete the record by setting the delete property to true and saving it
            item.deleted = true
            item.save().then((item) => res.send(item)).catch((err) => {}).finally(() => res.end()) // TODO log it
        })
        .catch((err) => {
            console.error(err)
            res.status(500).end()
        })
    }

    /**
     * `POST /apiv1/item` - create/import an item into the system
     * 
     * - `PARAM guid` - `guid` of the record to fetch
     * 
     * + `ERROR 422` if validation failed
     * @param req 
     * @param res 
     */
    public async post_item_importItem(req: Request, res: Response) {
        const itemToImport = req.body as Item
        itemToImport.type = populateTypeCode(itemToImport.type, {
            index: 'Type',
            code: 'Imported'
        } as TypeCode)
        itemToImport.deleted = false

        new ItemModel({
            typeIndex: itemToImport.type.index,
            type: itemToImport.type,
            name: itemToImport.name,
            deleted: false
        })
        .save()
        .then((savedItem) => {
            res.send(savedItem)
        })
        .catch((err) => {
            res.status(500).end()
        })
    }
}

export default ItemController
