import { randomUUID } from "crypto"
import { _MongoId } from "../common/types"
import { TypeCode } from "./TypeCode.model"
import { Schema, model } from "mongoose"


export interface User extends _MongoId {
    typeIndex: 'User'
    type: TypeCode
    username: string
    pbcrypt: string
    name: string
    admin: boolean
    enabled: boolean
}

export const UserSchema = new Schema<User>({
    guid: { type: String, default: function genUUID() {
        return randomUUID()
    }},
    typeIndex: { type: String, required: true },
    type: { type: Object, required: true },
    username: { type: String, unique: true, required: true },
    pbcrypt: { type: String, required: true },
    name: { type: String, required: true },
    deleted: { type: Boolean, default: false, required: true },
    admin: { type: Boolean, default: false, required: true }
})

export const UserModel = model('User', UserSchema)
