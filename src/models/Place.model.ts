import { randomUUID } from "crypto"
import { _MongoId } from "../common/types"
import { TypeCode } from "./TypeCode.model"
import { Schema, model } from "mongoose"

/**
 * A Place represents some location where Items are kept. This could be a room, shelf, drawer, computer, etc.
 * 
 * All Places must have a name and TypeCode at the very least.
 * They don't have to have a Place or anything else attached to them, but if the Place is located inside another Place,
 * the "parent" place's GUID should be set in `placeGuid`.
 */
export interface Place extends _MongoId {
    typeIndex: 'Place'
    type: TypeCode
    name: string
    placeGuid: string
}

export const PlaceSchema = new Schema<Place>({
    guid: { type: String, default: function genUUID() {
        return randomUUID()
    }},
    typeIndex: { type: String, required: true },
    type: { type: Object, required: true },
    name: { type: String, required: true },
    deleted: { type: Boolean, default: false, required: true },
    placeGuid: { type: String, required: false }
})

export const PlaceModel = model('Place', PlaceSchema)
