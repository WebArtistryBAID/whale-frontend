import { type OrderSchema, type OrderStatus, type OrderType } from './dataTypes.ts'

export interface LoginRedirectTarget {
    target: string
}

export interface OrderedItemCreateSchema {
    itemType: number
    appliedOptions: number[]
    amount: number
}

export interface OrderCreateSchema {
    type: OrderType
    deliveryRoom: string | null
    items: OrderedItemCreateSchema[]
    onSiteOrder: boolean
    onSiteName: string | null
}

export interface OrderEstimateSchema {
    time: number
    orders: number
    type: string | null
    number: string | null
    status: OrderStatus | null
}

export interface UserOrdersResponse {
    items: OrderSchema[]
    total: number
    page: number
    size: number
    pages: number
}

export interface UserStatisticsSchema {
    totalOrders: number
    totalSpent: string
    totalCups: number
    deletable: boolean
}

export interface StatsAggregateSchema {
    todayRevenue: string
    todayUniqueUsers: number
    todayOrders: number
    todayCups: number
    weekRevenue: string
    weekRevenueRange: string
    revenue: Record<string, string>
    uniqueUsers: Record<string, number>
    orders: Record<string, number>
    cups: Record<string, number>
}

export interface OrderQuotaSchema {
    onSiteToday: number
    onlineToday: number
}

export interface GenericError {
    detail: string
}
