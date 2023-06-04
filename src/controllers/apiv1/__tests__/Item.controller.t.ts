import mongoose from "mongoose"
import { makeServer } from "../../../../server"
import { Item } from "../../../models/Item.model"
import { PaginatedData } from "../../../common/types"
const request = require('supertest')

const BASEPATH = '/apiv1/item'

const BLANK_ITEM: Item = {
    typeIndex: "Item",
    type: {
        index: "Item",
        code: "SampleCode",
        translation: "#type.item.samplecode",
        deleted: false,
    },
    deleted: false,
    name: "SAMPLE"
}

describe('Item controller endpoints', () => {
    const server = makeServer()

    beforeAll(async () => {
        await mongoose.disconnect()
        await mongoose.connect(
            "mongodb://localhost:27017/tyin-test-server"
        )
    })

    afterAll(async () => {
        await mongoose.connection.dropCollection('items')
        await mongoose.disconnect()
    })

    it('Should return 404 if trying to find a nonexistent item', async () => {
        await request(server).get(`${BASEPATH}/sample-guid-doesnt-exist`).expect(404)
    })

    it('Should return the imported item as it exists in the database after import', async () => {
        const response = await request(server).post(`${BASEPATH}/`).send(BLANK_ITEM).expect(200)
        const importedItem = response.body as Item
        expect(importedItem.guid).toBeDefined()
        await request(server).delete(`${BASEPATH}/${importedItem.guid}`)
    })

    it('Should import, fetch, and delete 3 items', async () => {
        let paginatedResponse: PaginatedData<Item> | undefined

        for (let i = 0; i < 3; i++) {
            await request(server).post(`${BASEPATH}/`).send(BLANK_ITEM).expect(200)
            const response = await request(server).get(`${BASEPATH}/`).query().expect(200)
            paginatedResponse = response.body as PaginatedData<Item>
            expect(paginatedResponse.totalItems).toBe(i + 1)
        }
        
        for (let i = 0; i < 3; i++) {
            const delpath = `/apiv1/item/${paginatedResponse?.items[i]?.guid}`
            await request(server).delete(delpath).expect(200)
        }

        const response = await request(server).get(`${BASEPATH}/`).query().expect(200)
        paginatedResponse = response.body as PaginatedData<Item>
        expect(paginatedResponse.totalItems).toBe(0)
    })
    
})
