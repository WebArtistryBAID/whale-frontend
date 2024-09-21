import BasePage from '../../../BasePage.tsx'
import { useParams } from 'react-router-dom'
import ComponentError from '../../common/ComponentError.tsx'
import { useQuery } from '@tanstack/react-query'
import { getOrder, getOrderTimeEstimate } from '../../../data/api.ts'
import ComponentLoading from '../../common/ComponentLoading.tsx'
import ComponentTopBar from '../../common/ComponentTopBar.tsx'
import { Trans, useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faHourglass, faTriangleExclamation, faTruck } from '@fortawesome/free-solid-svg-icons'
import { faCircleCheck as faCircleCheckR, faHourglass as faHourglassR } from '@fortawesome/free-regular-svg-icons'
import { type OrderedItemSchema, OrderStatus, OrderType } from '../../../data/dataTypes.ts'
import ComponentIconText from '../../common/ComponentIconText.tsx'
import ComponentOrderedItem from '../order/ComponentOrderedItem.tsx'

import payQR from './assets/pay-qr.jpg'

export default function PageCheck(): JSX.Element {
    const { t } = useTranslation()

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
                            {(order.data.status === OrderStatus.waiting)
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
                                className={`flex flex-col items-center mr-3 ${order.data.status !== OrderStatus.waiting ? 'text-gray-400' : 'text-accent-orange'}`}>
                                <FontAwesomeIcon
                                    icon={order.data.status === OrderStatus.waiting ? faHourglass : faHourglassR}
                                    className="text-4xl mb-1"/>
                                <p className="text-xs text-center">{t('check.status.waiting_' + order.data.type)}</p>
                                {order.data.status === OrderStatus.waiting
                                    ? <p className="w-0 h-0 overflow-hidden">{t('check.status.current')}</p>
                                    : null}
                            </div>

                            <div
                                className={`flex flex-col items-center ${order.data.status !== OrderStatus.done ? 'text-gray-400' : 'text-green-400'}`}>
                                <FontAwesomeIcon
                                    icon={order.data.type === OrderType.delivery ? faTruck : (order.data.status === OrderStatus.done ? faCircleCheck : faCircleCheckR)}
                                    className="text-4xl mb-1"/>
                                <p className="text-xs text-center">{t('check.status.done_' + order.data.type)}</p>
                                {order.data.status === OrderStatus.done
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
                        {(order.data.status === OrderStatus.waiting)
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
                                className={`flex flex-col items-center mr-5 ${order.data.status !== OrderStatus.waiting ? 'text-gray-400' : 'text-accent-orange'}`}>
                                <FontAwesomeIcon
                                    icon={order.data.status === OrderStatus.waiting ? faHourglass : faHourglassR}
                                    className="text-4xl mb-1"/>
                                <p className="text-sm text-center">{t('check.status.waiting_' + order.data.type)}</p>
                                {order.data.status === OrderStatus.waiting
                                    ? <p className="w-0 h-0 overflow-hidden">{t('check.status.current')}</p>
                                    : null}
                            </div>

                            <div
                                className={`flex flex-col items-center ${order.data.status !== OrderStatus.done ? 'text-gray-400' : 'text-green-400'}`}>
                                <FontAwesomeIcon
                                    icon={order.data.type === OrderType.delivery ? faTruck : (order.data.status === OrderStatus.done ? faCircleCheck : faCircleCheckR)}
                                    className="text-4xl mb-1"/>
                                <p className="text-sm text-center">{t('check.status.done_' + order.data.type)}</p>
                                {order.data.status === OrderStatus.done
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
