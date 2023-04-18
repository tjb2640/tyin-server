import { Schema, model } from "mongoose"
import { _MongoId } from "../common/types"
import { randomUUID } from "crypto"

/**
 * A way to store and reference arbitrary categories or classifications.
 * 
 * `index` - defined per type as a constant value for easy reference in validation and lookup
 * 
 * `type` - a unique code for this type index
 * 
 * `translation` - should probably be a `#language.string` but can be a plaintext name
 */
export interface TypeCode extends _MongoId {
    index: string
    code: string
    translation: string
}

export const TypeCodeSchema = new Schema<TypeCode>({
    guid: { type: String, default: function genUUID() {
        return randomUUID()
    }},
    index: { type: String, required: true },
    code: { type: String, required: true },
    translation: { type: String, required: true },
})

export const PlaceModel = model('TypeCode', TypeCodeSchema)
