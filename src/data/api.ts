import {
    type AdSchema,
    type CategorySchema,
    type ItemTypeSchema,
    type OrderSchema,
    type OrderStatus,
    type UserSchemaSecure
} from './dataTypes.ts'
import {
    type GenericError,
    type LoginRedirectTarget,
    type OrderCreateSchema,
    type OrderEstimateSchema,
    type StatsAggregateSchema,
    type UserOrdersResponse,
    type UserStatisticsSchema
} from './apiDataTypes.ts'

export async function get(endpoint: string, query = new Map<string, string>(), token: string | null = null): Promise<any> {
    const entries = Array.from(query.entries())
    const queryParameters = entries.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)

    const response = await fetch(import.meta.env.VITE_API_HOST + '/' + endpoint + '?' + queryParameters.join('&'), {
        headers: {
            Authorization: token == null ? '' : `Bearer ${token}`
        }
    })
    const text = await response.text()

    if (text.length < 1) {
        return response.status === 200
    }

    return JSON.parse(text)
}

export async function post(endpoint: string, body: Record<string, any>, token: string | null = null): Promise<any> {
    const response = await fetch(import.meta.env.VITE_API_HOST + '/' + endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token == null ? '' : `Bearer ${token}`
        },
        body: JSON.stringify(body)
    })

    const text = await response.text()

    if (text.length < 1) {
        return response.status === 200
    }

    return JSON.parse(text)
}

export async function patch(endpoint: string, body: Record<string, any>, token: string | null = null): Promise<any> {
    const response = await fetch(import.meta.env.VITE_API_HOST + '/' + endpoint, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token == null ? '' : `Bearer ${token}`
        },
        body: JSON.stringify(body)
    })

    const text = await response.text()

    if (text.length < 1) {
        return response.status === 200
    }

    return JSON.parse(text)
}

export async function del(endpoint: string, query = new Map<string, string>(), token: string | null = null): Promise<any> {
    const entries = Array.from(query.entries())
    const queryParameters = entries.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)

    const response = await fetch(import.meta.env.VITE_API_HOST + '/' + endpoint + '?' + queryParameters.join('&'), {
        method: 'DELETE',
        headers: {
            Authorization: token == null ? '' : `Bearer ${token}`
        }
    })
    const text = await response.text()

    if (text.length < 1) {
        return response.status === 200
    }

    return JSON.parse(text)
}

export async function getItemTypes(): Promise<ItemTypeSchema[] | GenericError> {
    return await get('items')
}

export async function getItemTypesByCategory(category: number): Promise<ItemTypeSchema[] | GenericError> {
    return await get('items', new Map([['category', category.toString()]]))
}

export async function getItemType(id: number): Promise<ItemTypeSchema | GenericError> {
    return await get('item', new Map([['id', id.toString()]]))
}

export async function getCategories(): Promise<CategorySchema[] | GenericError> {
    return await get('categories')
}

export async function getCategory(id: number): Promise<CategorySchema | GenericError> {
    return await get('category', new Map([['id', id.toString()]]))
}

export async function getSettings(key: string): Promise<string | GenericError> {
    return await get('settings', new Map([['key', key]]))
}

export async function setSettings(key: string, value: string, token: string): Promise<string | GenericError> {
    return await get('settings/update', new Map([['key', key], ['value', value]]), token)
}

export async function getOrder(id: number): Promise<OrderSchema | GenericError> {
    return await get('order', new Map([['id', id.toString()]]))
}

export async function getOrders(page: number, token: string): Promise<UserOrdersResponse | GenericError> {
    return await get('orders', new Map([['page', page.toString()], ['size', '20']]), token)
}

export async function getOrderByNumber(number: string): Promise<OrderSchema | GenericError> {
    return await get('order/bynumber', new Map([['number', number]]))
}

export async function getOrderTimeEstimateNow(): Promise<OrderEstimateSchema | GenericError> {
    return await get('order/estimate')
}

export async function getOrderTimeEstimate(id: number): Promise<OrderEstimateSchema | GenericError> {
    return await get('order/estimate', new Map([['id', id.toString()]]))
}

export async function getAvailableOrders(token: string): Promise<OrderSchema[] | GenericError> {
    return await get('orders/available', new Map(), token)
}

export async function updateOrderStatus(orderId: number, status: OrderStatus, token: string): Promise<OrderSchema | GenericError> {
    return await patch('order', { id: orderId, status }, token)
}

export async function cancelOrder(id: number, token: string): Promise<boolean | GenericError> {
    return await del('order', new Map([['id', id.toString()]]), token)
}

export async function getOnSiteEligibility(name: string): Promise<boolean> {
    return await get('order/on-site-eligibility', new Map([['name', name]]))
}

export async function order(create: OrderCreateSchema, token: string): Promise<OrderSchema | GenericError> {
    return await post('order', create, token)
}

export async function getLoginRedirectTarget(redirect: string): Promise<LoginRedirectTarget> {
    return await get('login', new Map([['redirect', redirect]]))
}

export async function getMe(token: string): Promise<UserSchemaSecure | GenericError> {
    return await get('me', new Map(), token)
}

export async function getMeCanOrder(token: string): Promise<boolean | GenericError> {
    return await get('me/canorder', new Map(), token)
}

export async function getMeStatistics(token: string): Promise<UserStatisticsSchema | GenericError> {
    return await get('me/statistics', new Map(), token)
}

export async function deleteMe(token: string): Promise<boolean | GenericError> {
    return await del('me', new Map(), token)
}

export async function getStats(by: string, limit: number, token: string): Promise<StatsAggregateSchema | GenericError> {
    return await get('statistics', new Map([['by', by], ['limit', limit.toString()]]), token)
}

export async function getStatsExport(type: string, by: string, limit: number, token: string): Promise<string | GenericError> {
    return await get('statistics/export/token', new Map([['type', type], ['by', by], ['limit', limit.toString()]]), token)
}

export async function getAds(): Promise<AdSchema[]> {
    return await get('pms')
}

export function getUploadsRoot(): string {
    // Hack, I just want to get this done
    if ((import.meta.env.VITE_API_HOST as string).startsWith('/')) {
        return `${import.meta.env.VITE_API_HOST}${import.meta.env.VITE_API_HOST}`
    }
    return `${import.meta.env.VITE_API_HOST}${new URL(import.meta.env.VITE_API_HOST as string).pathname}`
}
