import BasePage from '../../../BasePage.tsx'
import { type PersistentStorage, usePersistentStorage } from '../../../data/persistentStorage.tsx'
import { useQuery } from '@tanstack/react-query'
import { getStats, getStatsExport } from '../../../data/api.ts'
import ComponentError from '../../common/ComponentError.tsx'
import ComponentLoading from '../../common/ComponentLoading.tsx'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

export default function PageStats(): JSX.Element {
    const persistentStorage: PersistentStorage = usePersistentStorage()
    const { t } = useTranslation()

    const [by, setBy] = useState('individual')
    const [limit, setLimit] = useState(180)

    const stats = useQuery({
        queryKey: ['stats'],
        queryFn: async () => await getStats(by, limit, persistentStorage.getToken()!)
    })

    const statsExport = useQuery({
        queryKey: ['stats-export'],
        queryFn: async () => await getStatsExport('statsExport', by, limit, persistentStorage.getToken()!),
        enabled: false,
        gcTime: Infinity
    })

    const ordersExport = useQuery({
        queryKey: ['orders-export'],
        queryFn: async () => await getStatsExport('ordersExport', by, limit, persistentStorage.getToken()!),
        enabled: false,
        gcTime: Infinity
    })

    if (stats.isError || (stats.data != null && 'detail' in stats.data)) {
        return <ComponentError screen={true} detail={stats} />
    }

    if (stats.isPending) {
        return <ComponentLoading screen={true} />
    }

    const revenue: any[] = [
        [
            { type: 'date', label: t('stats.time') },
            t('stats.revenue')
        ]
    ]
    for (const [key, value] of Object.entries(stats.data.revenue)) {
        revenue.push([new Date(key), parseFloat(value)])
    }
    const uniqueUsers: any[] = [
        [
            { type: 'date', label: t('stats.time') },
            t('stats.uniqueUsers')
        ]
    ]
    for (const [key, value] of Object.entries(stats.data.uniqueUsers)) {
        uniqueUsers.push([new Date(key), value])
    }
    const orders: any[] = [
        [
            { type: 'date', label: t('stats.time') },
            t('stats.orders')
        ]
    ]
    for (const [key, value] of Object.entries(stats.data.orders)) {
        orders.push([new Date(key), value])
    }
    const cups: any[] = [
        [
            { type: 'date', label: t('stats.time') },
            t('stats.cups')
        ]
    ]
    for (const [key, value] of Object.entries(stats.data.cups)) {
        cups.push([new Date(key), value])
    }

    async function exportStats(): Promise<void> {
        const result = await statsExport.refetch()
        if (result.isError || result.isRefetchError || typeof result.data === 'object') {
            return
        }
        location.href = `${import.meta.env.VITE_API_HOST}/statistics/export?token=${result.data}`
    }

    async function exportOrders(): Promise<void> {
        const result = await ordersExport.refetch()
        if (result.isError || result.isRefetchError || typeof result.data === 'object') {
            return
        }
        location.href = `${import.meta.env.VITE_API_HOST}/statistics/export?token=${result.data}`
    }

    return <BasePage>
        <div className='h-screen w-screen p-12 flex flex-col'>
            <p className='font-display text-lg mb-5 flex-shrink'>{t('stats.title')}</p>
            <div className="flex mb-5">
                <div className="mr-3">
                    <p className="text-gray-500 text-sm mb-1">{t('stats.limit')}</p>
                    <div className="p-2 bg-accent-yellow-bg w-32 rounded-full">
                        <input type="number" value={limit} onChange={e => {
                            setLimit(parseInt(e.target.value))
                        }} className="bg-transparent w-full"/>
                    </div>
                </div>

                <div className="mr-3">
                    <p className="text-gray-500 text-sm mb-1">{t('stats.by')}</p>
                    <div className="p-2 bg-accent-yellow-bg w-32 rounded-full">
                        <select value={by} onChange={e => {
                            setBy(e.target.value)
                        }} className="bg-transparent w-full">
                            <option value="individual">{t('stats.individual')}</option>
                            <option value="day">{t('stats.day')}</option>
                            <option value="week">{t('stats.week')}</option>
                            <option value="month">{t('stats.month')}</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={() => {
                        void stats.refetch()
                    }}
                    className="rounded-3xl bg-accent-yellow-bg hover:bg-accent-orange-bg transition-colors duration-100 py-2 px-4 text-lg mr-3">
                    {t('stats.refetch')}
                </button>

                <button
                    onClick={() => {
                        void exportStats()
                    }}
                    className="rounded-3xl bg-accent-yellow-bg hover:bg-accent-orange-bg transition-colors duration-100 py-2 px-4 text-lg mr-3">
                    {t('stats.export')}
                </button>

                <button
                    onClick={() => {
                        void exportOrders()
                    }}
                    className="rounded-3xl bg-accent-yellow-bg hover:bg-accent-orange-bg transition-colors duration-100 py-2 px-4 text-lg">
                    {t('stats.exportOrders')}
                </button>
            </div>

            <div className="flex mb-5">
                <div className="mr-5">
                    <p className="text-sm text-gray-500 mb-1">{t('stats.todayRevenue')}</p>
                    <p className="font-bold text-4xl font-display">¥{stats.data.todayRevenue}</p>
                </div>
                <div className='mr-5'>
                    <p className='text-sm text-gray-500 mb-1'>{t('stats.todayOrders')}</p>
                    <p className='font-bold text-4xl font-display'>{stats.data.todayOrders}</p>
                </div>
                <div className='mr-5'>
                    <p className='text-sm text-gray-500 mb-1'>{t('stats.todayCups')}</p>
                    <p className='font-bold text-4xl font-display'>{stats.data.todayCups}</p>
                </div>
                <div className='mr-5'>
                    <p className='text-sm text-gray-500 mb-1'>{t('stats.todayUniqueUsers')}</p>
                    <p className='font-bold text-4xl font-display'>{stats.data.todayUniqueUsers}</p>
                </div>
                <div>
                    <p className='text-sm text-gray-500 mb-1'>{t('stats.weekRevenue')} ({stats.data.weekRevenueRange})</p>
                    <p className='font-bold text-4xl font-display'>¥{stats.data.weekRevenue}</p>
                </div>
            </div>
        </div>
    </BasePage>
}
