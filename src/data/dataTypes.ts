export interface UserSchema {
    id: string
    name: string
    permissions: string
    blocked: boolean
    points: string
}

export interface UserSchemaSecure {
    id: string
    name: string
    permissions: string
    pinyin: string | null
    phone: string | null
    blocked: boolean
    points: string
}

export interface CategorySchema {
    id: number
    name: string
}

export interface TagSchema {
    id: number
    name: string
    color: string
}

export interface OptionTypeSchema {
    id: number
    name: string
    items: OptionItemSchema[]
}

export interface OptionItemSchema {
    id: number
    name: string
    typeId: number
    isDefault: boolean
    priceChange: string
    soldOut: boolean
}

export interface ItemTypeSchema {
    id: number
    category: CategorySchema
    name: string
    image: string
    tags: TagSchema[]
    description: string
    shortDescription: string
    options: OptionTypeSchema[]
    basePrice: string
    salePercent: number
    soldOut: boolean
}

export interface OrderedItemSchema {
    id: number
    orderId: number
    itemType: ItemTypeSchema
    appliedOptions: OptionItemSchema[]
    amount: number
}

export enum OrderStatus {
    waiting = 'waiting',
    done = 'done'
}

export enum OrderType {
    pickUp = 'pickUp',
    delivery = 'delivery'
}

export interface OrderSchema {
    id: number
    totalPrice: string
    number: string
    status: OrderStatus
    type: OrderType
    deliveryRoom: string | null
    createdTime: string
    user: UserSchema
    items: OrderedItemSchema[]
    onSiteName: string | null
    paid: boolean
}

export interface AdSchema {
    id: number
    name: string
    image: string
    url: string
}
