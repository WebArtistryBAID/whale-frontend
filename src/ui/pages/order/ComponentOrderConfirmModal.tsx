import { Trans, useTranslation } from 'react-i18next'
import ComponentIconText from '../../common/ComponentIconText.tsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation, faClock, faClose, faMugHot, faTruck } from '@fortawesome/free-solid-svg-icons'
import { type OptionTypeSchema, type OrderedItemSchema, type OrderSchema, OrderType } from '../../../data/dataTypes.ts'
import ComponentOrderedItem from './ComponentOrderedItem.tsx'
import { useShoppingCart } from '../../../data/shoppingCart.tsx'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getOnSiteEligibility, getOrderTimeEstimateNow, order } from '../../../data/api.ts'
import {
    type OrderCreateSchema,
    type OrderedItemCreateSchema,
    type OrderEstimateSchema
} from '../../../data/apiDataTypes.ts'
import ComponentLoading from '../../common/ComponentLoading.tsx'
import ComponentError from '../../common/ComponentError.tsx'
import { useNavigate } from 'react-router-dom'
import { type PersistentStorage, usePersistentStorage } from '../../../data/persistentStorage.tsx'
import { useState } from 'react'

export default function ComponentOrderConfirmModal({
    open,
    close
}: { open: boolean, close: () => void }): JSX.Element {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const persistentStorage: PersistentStorage = usePersistentStorage()
    const [orderType, setOrderType] = useState(OrderType.pickUp)
    const [onSiteName, setOnSiteName] = useState('')
    const [onSiteNameError, setOnSiteNameError] = useState('')
    const [deliveryRoom, setDeliveryRoom] = useState('')
    const [deliveryRoomError, setDeliveryRoomError] = useState('')

    const orderCreate = useMutation({
        mutationFn: async (data: OrderCreateSchema) => await order(data, persistentStorage.getToken()!),
        onSuccess: (data) => {
            clear()
            persistentStorage.setCurrentOrder((data as OrderSchema).id)
            navigate(`/check/${(data as OrderSchema).id}`)
        }
    })

    const {
        items,
        getTotalPrice,
        getTotalItems,
        getOnSiteOrderMode,
        clear
    } = useShoppingCart()

    const estimate = useQuery({
        queryKey: ['estimate', `estimate-${getTotalPrice().toString()}`],
        queryFn: getOrderTimeEstimateNow,
        refetchInterval: 10000
    })

    const osnEligibility = useQuery({
        queryKey: ['osn-eligibility', `osn-eligibility-${onSiteName}`],
        queryFn: async () => await getOnSiteEligibility(onSiteName),
        enabled: false,
        gcTime: Infinity
    })

    async function submit(): Promise<void> {
        setOnSiteName(onSiteName.trim())
        setDeliveryRoom(deliveryRoom.trim())

        setDeliveryRoomError('')
        if (orderType === OrderType.delivery && (deliveryRoom.length !== 3 || Number.isNaN(parseInt(deliveryRoom)) ||
            parseInt(deliveryRoom[0]) < 1 || parseInt(deliveryRoom[0]) > 4 || parseInt(deliveryRoom[1]) > 2)) {
            setDeliveryRoomError(t('order.confirm.roomError'))
            return
        }

        setOnSiteNameError('')
        if (getOnSiteOrderMode() as boolean && onSiteName.length < 1) {
            setOnSiteNameError(t('order.confirm.onSiteNameError'))
            return
        }

        // Some people like to use 3-character abbreviations for their names,
        // and that makes it difficult to track who they are. We block this
        // behavior.
        let hasNonEnglish = false
        for (const char of onSiteName) {
            if (char.charCodeAt(0) > 127) {
                hasNonEnglish = true
                break
            }
        }

        if (getOnSiteOrderMode()) {
            if (!hasNonEnglish && onSiteName.length < 5) {
                setOnSiteNameError(t('order.confirm.onSiteNameReal'))
                return
            }

            const result = await osnEligibility.refetch()
            if (result.isError) {
                return
            }
            if (result.data === false) {
                setOnSiteNameError(t('order.confirm.onSiteNameIneligible'))
                return
            }
        }

        const createItems: OrderedItemCreateSchema[] = []

        for (const item of items) {
            createItems.push({
                itemType: item.itemType.id,
                appliedOptions: item.appliedOptions.map((option: OptionTypeSchema) => option.id),
                amount: item.amount
            })
        }

        orderCreate.mutate({
            type: orderType,
            deliveryRoom,
            items: createItems,
            onSiteOrder: getOnSiteOrderMode(),
            onSiteName: getOnSiteOrderMode() as boolean ? onSiteName : null
        })
    }

    return (
        <>
            <div className={`w-screen h-screen absolute justify-center items-center flex bg-gray-500/30
                  top-0 left-0 z-[60] transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} role='dialog'>
                <div
                    className='z-[70] bg-white lg:shadow-lg lg:rounded-3xl w-full lg:w-1/2 2xl:w-1/3 h-full lg:max-h-[80%] 2xl:max-h-[50%] overflow-y-auto'>

                    {orderCreate.isPending ? <ComponentLoading /> : null}
                    {orderCreate.isError ? <ComponentError /> : null}

                    {orderCreate.isIdle
                        ? <div>
                            <div className='p-8 pt-12 lg:p-12'>
                                <div className='flex items-center mb-5'>
                                    <h1 className='text-3xl font-bold font-display flex-grow'>{t('order.confirm.title')}</h1>
                                    <button
                                        className='rounded-full w-10 h-10 hover:bg-gray-50 flex-shrink transition-colors duration-100'
                                        onClick={() => {
                                            close()
                                        }}
                                        aria-label={t('a11y.close')}>
                                        <FontAwesomeIcon icon={faClose} className='text-xl' />
                                    </button>
                                </div>

                                {getOnSiteOrderMode() as boolean
                                    ? null
                                    : <div className='mb-5 flex w-full'>
                                        <button onClick={() => { setOrderType(OrderType.pickUp) }}
                                                className={`lg:mr-3 w-1/2 flex items-center justify-center px-3 py-5 rounded-l-3xl lg:rounded-3xl ${orderType === OrderType.pickUp ? 'bg-accent-yellow-bg' : 'bg-gray-50 hover:bg-accent-yellow-bg'} transition-colors duration-100`}>
                                            <FontAwesomeIcon icon={faMugHot} className='text-accent-red text-2xl lg:text-3xl mr-3' />
                                            <p className="text-lg lg:text-xl">{t('order.type.pickUp')}</p>
                                        </button>
                                        <button onClick={() => { setOrderType(OrderType.delivery) }}
                                                className={`w-1/2 flex items-center justify-center px-3 py-5 rounded-r-3xl lg:rounded-3xl ${orderType === OrderType.delivery ? 'bg-accent-yellow-bg' : 'bg-gray-50 hover:bg-accent-yellow-bg'} transition-colors duration-100`}>
                                            <FontAwesomeIcon icon={faTruck} className='text-accent-orange text-2xl lg:text-3xl mr-3' />
                                            <p className="text-lg lg:text-xl">{t('order.type.delivery')}</p>
                                        </button>
                                    </div>}

                                {orderType === OrderType.delivery
                                    ? <div className='mb-5'>
                                        <p className='text-gray-400 text-xs mb-2'>{t('order.confirm.deliveryInformation')}</p>
                                        <div className='mb-1 rounded-full bg-accent-yellow-bg p-2'>
                                            <input placeholder={t('order.confirm.room')}
                                                   aria-label={t('order.confirm.room')} type="text"
                                                   className="w-full bg-transparent" value={deliveryRoom}
                                                   onChange={(e) => {
                                                       setDeliveryRoom(e.target.value)
                                                   }}/>
                                        </div>
                                        <p className='mb-2 text-xs text-accent-red'>{deliveryRoomError}</p>
                                    </div>
                                    : null}

                                {getOnSiteOrderMode() as boolean
                                    ? <div className="mb-5">
                                        <p className="text-gray-400 text-xs mb-2">{t('order.confirm.onSiteName')}</p>
                                        <div className="mb-1 rounded-full bg-accent-yellow-bg p-2">
                                            <input placeholder={t('order.confirm.onSiteName')}
                                                   aria-label={t('order.confirm.onSiteName')} type="text"
                                                   className="w-full bg-transparent" value={onSiteName}
                                                   onChange={(e) => {
                                                       setOnSiteName(e.target.value)
                                                   }}/>
                                        </div>
                                        <p className="mb-2 text-xs text-accent-red">{onSiteNameError}</p>
                                    </div>
                                    : null}

                                <p className='text-gray-400 text-xs mb-2'>{t('order.confirm.importantInformation')}</p>
                                <div className='mb-3'>
                                    <ComponentIconText
                                        icon={<FontAwesomeIcon icon={faClock} className='text-accent-red' />}>
                                        {estimate.isError ? t('order.confirm.waitError') : null}
                                        {estimate.isPending ? t('order.confirm.waitLoading') : null}
                                        {estimate.data != null
                                            ? <Trans i18nKey={'order.confirm.waitTime'}
                                                     count={(estimate.data as OrderEstimateSchema).time + getTotalItems() * 2}
                                                     components={{ 1: <strong></strong> }}/>
                                            : null}
                                    </ComponentIconText>
                                </div>
                                <div className='mb-5'>
                                    <ComponentIconText
                                        icon={<FontAwesomeIcon icon={faCircleExclamation} className='text-accent-orange' />}>
                                        <Trans i18nKey={'order.confirm.payment'}
                                               components={{
                                                   1: <strong></strong>,
                                                   2: <u></u>
                                               }}/>
                                    </ComponentIconText>
                                </div>

                                <p className='text-gray-400 text-xs mb-2'>{t('order.confirm.orders')}</p>
                                <div className='mb-12 lg:mb-0'>
                                    {items.map((item: OrderedItemSchema) => <ComponentOrderedItem key={item.id}
                                                                                                  item={item}/>)}
                                </div>
                            </div>

                            <div className='fixed lg:sticky w-full bg-gray-100 bottom-0 flex'>
                                <div className='flex-grow p-4'>
                                    <p className='text-lg font-display'><Trans i18nKey='order.confirm.total'
                                                                               count={getTotalPrice().toString()}/></p>
                                </div>

                                <button className='flex-shrink lg:rounded-br-3xl transition-colors duration-100
                     flex bg-accent-orange-bg hover:bg-amber-100 py-3 px-8 justify-center items-center'
                                        onClick={() => {
                                            void submit()
                                        }}>
                                    <p>{t('order.confirm.confirm')}</p>
                                </button>
                            </div>
                        </div>
                        : null}
                </div>
            </div>
        </>
    )
}
