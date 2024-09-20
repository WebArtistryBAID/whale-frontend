import BasePage from '../../../BasePage.tsx'
import { useNavigate, useParams } from 'react-router-dom'
import ComponentError from '../../common/ComponentError.tsx'
import { useMutation, useQuery } from '@tanstack/react-query'
import { cancelOrder, getOrder, getOrderTimeEstimate } from '../../../data/api.ts'
import ComponentLoading from '../../common/ComponentLoading.tsx'
import ComponentTopBar from '../../common/ComponentTopBar.tsx'
import { Trans, useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCircleCheck,
    faFaceSmile,
    faHourglass,
    faHourglassHalf,
    faTriangleExclamation,
    faTruck
} from '@fortawesome/free-solid-svg-icons'
import {
    faCircleCheck as faCircleCheckR,
    faFaceSmile as faFaceSmileR,
    faHourglass as faHourglassR,
    faHourglassHalf as faHourglassHalfR
} from '@fortawesome/free-regular-svg-icons'
import { type OrderedItemSchema, OrderStatus, OrderType } from '../../../data/dataTypes.ts'
import ComponentIconText from '../../common/ComponentIconText.tsx'
import ComponentOrderedItem from '../order/ComponentOrderedItem.tsx'
import { useState } from 'react'
import { type PersistentStorage, usePersistentStorage } from '../../../data/persistentStorage.tsx'

import payQR from './assets/pay-qr.jpg'

export default function PageCheck(): JSX.Element {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const persistentStorage: PersistentStorage = usePersistentStorage()
    const [cancelConfirm, setCancelConfirm] = useState(false)

    const { id } = useParams()
    if (id == null) {
        return <BasePage><ComponentError screen={true}/></BasePage>
    }

    const order = useQuery({
        queryKey: ['order', `order-${id}`],
        refetchInterval: 10000,
        queryFn: async () => await getOrder(parseInt(id))
    })

    const estimate = useQuery({
        queryKey: ['order-check-estimate', `order-${id}`],
        refetchInterval: 10000,
        queryFn: async () => await getOrderTimeEstimate(parseInt(id))
    })

    const orderCancel = useMutation({
        mutationFn: async () => await cancelOrder(parseInt(id), persistentStorage.getToken()!),
        onSuccess: () => {
            setCancelConfirm(false)
            if (typeof orderCancel.data === 'object') {
                return
            }
            navigate('/')
        },
        onError: () => {
            setCancelConfirm(false)
        }
    })

    const now = new Date()
    const productionNotStarted = now.getHours() < 12 || (now.getHours() === 12 && now.getMinutes() < 30)

    if (order.isPending || estimate.isPending) {
        return <BasePage><ComponentLoading screen={true}/></BasePage>
    }

    if (order.isError || 'detail' in order.data) {
        return <BasePage><ComponentError screen={true} detail={order}/></BasePage>
    }

    if (estimate.isError || 'detail' in estimate.data) {
        return <BasePage><ComponentError screen={true} detail={estimate}/></BasePage>
    }

    function cancel(): void {
        if (cancelConfirm) {
            orderCancel.mutate()
        } else {
            setCancelConfirm(true)
        }
    }

    return (
        <BasePage>
            <div className="lg:hidden flex flex-col h-screen bg-accent-latte">
                <div className="flex-shrink">
                    <ComponentTopBar/>
                </div>

                <div id="main" className="h-full">
                    <div className="flex-grow p-8 pt-16">
                        <div className="flex flex-col items-center">
                            <h1 className="text-6xl font-bold font-display mb-3">{order.data.number}</h1>
                            {(order.data.status === OrderStatus.notStarted || order.data.status === OrderStatus.inProgress)
                                ? (
                                    productionNotStarted
                                        ? <p className="text-sm mb-5 text-center">
                                            {t('check.waitingToStart')}
                                        </p>
                                        : <>
                                            <p className="text-sm text-center">
                                                <Trans i18nKey="check.estimateOrders" count={estimate.data.orders}
                                                       components={{ 1: <strong></strong> }}/>
                                            </p>
                                            <p className="text-sm mb-5 text-center">
                                                <Trans i18nKey="check.estimateTime" count={estimate.data.time}
                                                       components={{ 1: <strong></strong> }}/>
                                            </p>
                                        </>
                                )
                                : <p className="text-sm mb-5 text-center">{t(`check.${order.data.status}_${order.data.type}`)}</p>}
                        </div>

                        <div className="flex mb-5 justify-center">
                            <div
                                className={`flex flex-col items-center mr-3 ${order.data.status !== OrderStatus.notStarted ? 'text-gray-400' : 'text-accent-orange'}`}>
                                <FontAwesomeIcon
                                    icon={order.data.status === OrderStatus.notStarted ? faHourglass : faHourglassR}
                                    className="text-4xl mb-1"/>
                                <p className="text-xs text-center">{t('check.status.notStarted_' + order.data.type)}</p>
                                {order.data.status === OrderStatus.notStarted
                                    ? <p className="w-0 h-0 overflow-hidden">{t('check.status.current')}</p>
                                    : null}
                            </div>

                            <div
                                className={`flex flex-col items-center mr-3 ${order.data.status !== OrderStatus.inProgress ? 'text-gray-400' : 'text-blue-500'}`}>
                                <FontAwesomeIcon
                                    icon={order.data.status === OrderStatus.inProgress ? faHourglassHalf : faHourglassHalfR}
                                    className="text-4xl mb-1"/>
                                <p className="text-xs text-center">{t('check.status.inProgress_' + order.data.type)}</p>
                                {order.data.status === OrderStatus.inProgress
                                    ? <p className="w-0 h-0 overflow-hidden">{t('check.status.current')}</p>
                                    : null}
                            </div>

                            <div
                                className={`flex flex-col items-center mr-3 ${order.data.status !== OrderStatus.ready ? 'text-gray-400' : 'text-green-400'}`}>
                                <FontAwesomeIcon
                                    icon={order.data.type === OrderType.delivery ? faTruck : (order.data.status === OrderStatus.ready ? faCircleCheck : faCircleCheckR)}
                                    className="text-4xl mb-1"/>
                                <p className="text-xs text-center">{t('check.status.ready_' + order.data.type)}</p>
                                {order.data.status === OrderStatus.ready
                                    ? <p className="w-0 h-0 overflow-hidden">{t('check.status.current')}</p>
                                    : null}
                            </div>

                            <div
                                className={`flex flex-col items-center ${order.data.status !== OrderStatus.pickedUp ? 'text-gray-400' : 'text-yellow-400'}`}>
                                <FontAwesomeIcon
                                    icon={order.data.status === OrderStatus.pickedUp ? faFaceSmile : faFaceSmileR}
                                    className="text-4xl mb-1"/>
                                <p className="text-xs text-center">{t('check.status.pickedUp_' + order.data.type)}</p>
                                {order.data.status === OrderStatus.pickedUp
                                    ? <p className="w-0 h-0 overflow-hidden">{t('check.status.current')}</p>
                                    : null}
                            </div>
                        </div>

                        <div className="mb-3 w-full">
                            <ComponentIconText
                                icon={<FontAwesomeIcon icon={faTriangleExclamation} className="text-yellow-400"/>}>
                                {t('check.message.orderNumber')}
                            </ComponentIconText>
                        </div>

                        <div className="mb-5 w-full">
                            <ComponentIconText
                                icon={<FontAwesomeIcon icon={faTriangleExclamation} className="text-yellow-400"/>}>
                                {t('check.message.pay')}
                            </ComponentIconText>
                        </div>

                        <p className="text-gray-400 text-xs mb-2">{t('check.totalPrice')}</p>
                        <p className="font-display font-bold text-3xl mb-5">¥{order.data.totalPrice}</p>

                        <p className="text-gray-400 text-xs mb-2">{t('check.orderType')}</p>
                        <p className="font-display font-bold text-3xl mb-5">{t(`order.type.${order.data.type}`)}</p>

                        {order.data.type === OrderType.delivery
                            ? <p className="text-gray-400 text-xs mb-2">{t('check.deliveryRoom')}</p>
                            : null}
                        {order.data.type === OrderType.delivery
                            ? <p className="font-display font-bold text-3xl mb-5">{order.data.deliveryRoom}</p>
                            : null}

                        <p className="text-gray-400 text-xs mb-2">{t('check.payQR')}</p>
                        <p className="text-accent-red text-xl mb-2">{t('check.payQRNote')}</p>
                        <img src={payQR} alt="QR code" className="w-full rounded-3xl mx-auto mb-5"/>

                        <p className="text-gray-400 text-xs mb-2">{t('check.products')}</p>
                        {order.data.items.map((item: OrderedItemSchema) => <ComponentOrderedItem key={item.id}
                                                                                                 item={item}/>)}

                        {order.data.status === OrderStatus.notStarted
                            ? <button onClick={cancel}
                                      className={`mt-5 p-2 w-full rounded-full font-bold transition-colors duration-100 ${orderCancel.isError || typeof orderCancel.data === 'object' || orderCancel.isPending ? 'bg-gray-300 text-gray-400' : 'bg-accent-red hover:bg-red-500 text-white'}`}>
                                {orderCancel.isPending ? t('check.cancelLoading') : null}
                                {orderCancel.isIdle ? (cancelConfirm ? t('check.cancelConfirm') : t('check.cancel')) : null}
                                {orderCancel.isError || typeof orderCancel.data === 'object' ? t('check.cancelFailed') : null}
                            </button>
                            : null}
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex h-screen flex-col bg-accent-latte">
                <div className="flex-shrink">
                    <ComponentTopBar/>
                </div>
                <div id="main" className="flex flex-grow min-h-0">
                    <div
                        className="w-1/2 border-r border-gray-300 border-solid p-16 h-full overflow-y-auto relative flex flex-col justify-center items-center">
                        <h1 className="text-7xl xl:text-[7rem] font-bold font-display mb-3">{order.data.number}</h1>
                        {(order.data.status === OrderStatus.notStarted || order.data.status === OrderStatus.inProgress)
                            ? (
                                productionNotStarted
                                    ? <p className="text-xl mb-8 text-center">
                                        {t('check.waitingToStart')}
                                    </p>
                                    : <>
                                        <p className="text-xl mb-1 text-center">
                                            <Trans i18nKey="check.estimateOrders" count={estimate.data.orders}
                                                   components={{ 1: <strong></strong> }}/>
                                        </p>
                                        <p className="text-xl mb-8 text-center">
                                            <Trans i18nKey="check.estimateTime" count={estimate.data.time}
                                                   components={{ 1: <strong></strong> }}/>
                                        </p>
                                    </>
                            )
                            : <p className="text-xl mb-8 text-center">{t(`check.${order.data.status}_${order.data.type}`)}</p>}

                        <div className="flex mb-8">
                            <div
                                className={`flex flex-col items-center mr-5 ${order.data.status !== OrderStatus.notStarted ? 'text-gray-400' : 'text-accent-orange'}`}>
                                <FontAwesomeIcon
                                    icon={order.data.status === OrderStatus.notStarted ? faHourglass : faHourglassR}
                                    className="text-4xl mb-1"/>
                                <p className="text-sm text-center">{t('check.status.notStarted_' + order.data.type)}</p>
                                {order.data.status === OrderStatus.notStarted
                                    ? <p className="w-0 h-0 overflow-hidden">{t('check.status.current')}</p>
                                    : null}
                            </div>

                            <div
                                className={`flex flex-col items-center mr-5 ${order.data.status !== OrderStatus.inProgress ? 'text-gray-400' : 'text-blue-500'}`}>
                                <FontAwesomeIcon
                                    icon={order.data.status === OrderStatus.inProgress ? faHourglassHalf : faHourglassHalfR}
                                    className="text-4xl mb-1"/>
                                <p className="text-sm text-center">{t('check.status.inProgress_' + order.data.type)}</p>
                                {order.data.status === OrderStatus.inProgress
                                    ? <p className="w-0 h-0 overflow-hidden">{t('check.status.current')}</p>
                                    : null}
                            </div>

                            <div
                                className={`flex flex-col items-center mr-5 ${order.data.status !== OrderStatus.ready ? 'text-gray-400' : 'text-green-400'}`}>
                                <FontAwesomeIcon
                                    icon={order.data.type === OrderType.delivery ? faTruck : (order.data.status === OrderStatus.ready ? faCircleCheck : faCircleCheckR)}
                                    className="text-4xl mb-1"/>
                                <p className="text-sm text-center">{t('check.status.ready_' + order.data.type)}</p>
                                {order.data.status === OrderStatus.ready
                                    ? <p className="w-0 h-0 overflow-hidden">{t('check.status.current')}</p>
                                    : null}
                            </div>

                            <div
                                className={`flex flex-col items-center ${order.data.status !== OrderStatus.pickedUp ? 'text-gray-400' : 'text-yellow-400'}`}>
                                <FontAwesomeIcon
                                    icon={order.data.status === OrderStatus.pickedUp ? faFaceSmile : faFaceSmileR}
                                    className="text-4xl mb-1"/>
                                <p className="text-sm text-center">{t('check.status.pickedUp_' + order.data.type)}</p>
                                {order.data.status === OrderStatus.pickedUp
                                    ? <p className="w-0 h-0 overflow-hidden">{t('check.status.current')}</p>
                                    : null}
                            </div>
                        </div>

                        <div className="w-96">
                            <div className="mb-3">
                                <ComponentIconText
                                    icon={<FontAwesomeIcon icon={faTriangleExclamation} className="text-yellow-400"/>}>
                                    {t('check.message.orderNumber')}
                                </ComponentIconText>
                            </div>

                            <div className="mb-3">
                                <ComponentIconText
                                    icon={<FontAwesomeIcon icon={faTriangleExclamation} className="text-yellow-400"/>}>
                                    {t('check.message.pay')}
                                </ComponentIconText>
                            </div>

                            {order.data.status === OrderStatus.notStarted
                                ? <button onClick={cancel}
                                          className={`p-2 w-full rounded-full font-bold transition-colors duration-100 ${orderCancel.isError || typeof orderCancel.data === 'object' || orderCancel.isPending ? 'bg-gray-300 text-gray-400' : 'bg-accent-red hover:bg-red-500 text-white'}`}>
                                    {orderCancel.isPending ? t('check.cancelLoading') : null}
                                    {orderCancel.isIdle ? (cancelConfirm ? t('check.cancelConfirm') : t('check.cancel')) : null}
                                    {orderCancel.isError || typeof orderCancel.data === 'object' ? t('check.cancelFailed') : null}
                                </button>
                                : null}
                        </div>
                    </div>
                    <div className="w-1/2 h-full p-8 xl:p-12 2xl:px-24 2xl:py-16 overflow-y-auto">
                        <p className="text-gray-400 text-xs mb-2">{t('check.totalPrice')}</p>
                        <p className="font-display font-bold text-4xl mb-5">¥{order.data.totalPrice}</p>

                        <p className="text-gray-400 text-xs mb-2">{t('check.orderType')}</p>
                        <p className="font-display font-bold text-4xl mb-5">{t(`order.type.${order.data.type}`)}</p>

                        {order.data.type === OrderType.delivery
                            ? <p className="text-gray-400 text-xs mb-2">{t('check.deliveryRoom')}</p>
                            : null}
                        {order.data.type === OrderType.delivery
                            ? <p className="font-display font-bold text-4xl mb-5">{order.data.deliveryRoom}</p>
                            : null}

                        <p className="text-gray-400 text-xs mb-2">{t('check.payQR')}</p>
                        <p className="text-accent-red text-2xl mb-2">{t('check.payQRNote')}</p>
                        <img src={payQR} alt="QR code" className="w-full rounded-3xl xl:w-1/2 mx-auto mb-5"/>

                        <p className="text-gray-400 text-xs mb-2">{t('check.products')}</p>
                        {order.data.items.map((item: OrderedItemSchema) => <ComponentOrderedItem key={item.id}
                                                                                                 item={item}/>)}
                    </div>
                </div>
            </div>
        </BasePage>
    )
}
