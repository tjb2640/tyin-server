import { TypeCode } from "./TypeCode.model"
import { _MongoId } from "../common/types"
import * as mongoose from "mongoose"
import { randomUUID } from "crypto"

/**
 * An Item represents some "thing" which is kept track of by the inventory system.
 * 
 * All Items must have a name at the very least. They don't have to have a Place or anything else attached to them.
 * If the Item does have a specific place where it is stored, the GUID of the place should be set in `placeGuid`.
 * If the Item is part of another Item, the "parent" item's GUID should be set with `itemGuid`.
 */
export interface Item extends _MongoId {
    typeIndex: 'Item'
    type: TypeCode
    name: string
    itemGuid?: string
    placeGuid?: string
}

export const ItemSchema = new mongoose.Schema<Item>({
    guid: { type: String, default: function genUUID() {
        return randomUUID()
    }},
    typeIndex: { type: String, required: true },
    type: { type: Object, required: true },
    name: { type: String, required: true },
    deleted: { type: Boolean, default: false, required: true },
    itemGuid: { type: String, required: false, },
    placeGuid: { type: String, required: false }
})

export const ItemModel = mongoose.model('Item', ItemSchema)
