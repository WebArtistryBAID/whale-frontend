import { type OrderedItemSchema } from './data/dataTypes.ts'
import Decimal from 'decimal.js'

export function moneyRound(n: Decimal): Decimal {
    return n.mul(100).round().div(100)
}

export function getUploadsRoot(): string {
    // Hack, I just want to get this done
    if ((import.meta.env.VITE_API_HOST as string).startsWith('/')) {
        return `${import.meta.env.VITE_API_HOST}${import.meta.env.VITE_API_HOST}`
    }
    return `${import.meta.env.VITE_API_HOST}${new URL(import.meta.env.VITE_API_HOST as string).pathname}`
}

// Frontend money calculation is for display only -- real money calculation is done on the backend with Decimals
export function frontendCalculate(item: OrderedItemSchema): Decimal {
    return new Decimal(item.itemType.basePrice)
        .mul(item.itemType.salePercent)
        .add(item.appliedOptions
            .map(option => option.priceChange)
            .reduce((partialSum, current) => partialSum.add(current), new Decimal(0))
        ).mul(item.amount)
}
