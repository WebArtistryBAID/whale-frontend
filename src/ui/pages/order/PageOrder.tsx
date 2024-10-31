import BasePage from '../../../BasePage.tsx'
import ComponentCategories from './ComponentCategories.tsx'
import ComponentCategory from './ComponentCategory.tsx'
import ComponentAd from './ComponentAd.tsx'
import ComponentShoppingCart from './ComponentShoppingCart.tsx'
import { useEffect, useState } from 'react'
import ComponentOrderConfirmModal from './ComponentOrderConfirmModal.tsx'
import { useQuery } from '@tanstack/react-query'
import { getAds, getCategories, getMe, getMeCanOrder, getOrderQuota, getSettings } from '../../../data/api.ts'
import ComponentError from '../../common/ComponentError.tsx'
import ComponentLoading from '../../common/ComponentLoading.tsx'
import { type ItemTypeSchema } from '../../../data/dataTypes.ts'
import ComponentItemDetails from './ComponentItemDetails.tsx'
import { useShoppingCart } from '../../../data/shoppingCart.tsx'
import { type PersistentStorage, usePersistentStorage } from '../../../data/persistentStorage.tsx'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ComponentTopBar from '../../common/ComponentTopBar.tsx'

import FullScreenMessage from '../../common/FullScreenMessage.tsx'

import payQR from '../check/assets/pay-qr.jpg'
import loginBg from '../../common/assets/login-bg.webp'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

export default function PageOrder(): JSX.Element {
    const { t } = useTranslation()

    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [pickItem, setPickItem] = useState<ItemTypeSchema | null>(null)
    const shoppingCart = useShoppingCart()
    const persistentStorage: PersistentStorage = usePersistentStorage()
    const navigate = useNavigate()

    const categories = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories
    })

    const getShopOpen = useQuery({
        queryKey: ['get-shop-open'],
        queryFn: async () => await getSettings('shop-open')
    })

    const ads = useQuery({
        queryKey: ['ads'],
        queryFn: async () => await getAds()
    })

    const me = useQuery({
        queryKey: ['user-info-from-token'],
        queryFn: async () => await getMe(persistentStorage.getToken()!)
    })

    const meCanOrder = useQuery({
        queryKey: ['me-can-order'],
        queryFn: async () => await getMeCanOrder(persistentStorage.getToken()!)
    })

    const quota = useQuery({
        queryKey: ['order-quota'],
        queryFn: async () => await getOrderQuota()
    })

    const singleQuota = useQuery({
        queryKey: ['order-single-quota'],
        queryFn: async () => await getSettings('order-quota')
    })

    const totalQuota = useQuery({
        queryKey: ['order-total-quota'],
        queryFn: async () => await getSettings('total-quota')
    })

    useEffect(() => {
        if (persistentStorage.getToken() == null) {
            navigate('/login/oauth2/_order')
        }
    }, [])

    if (categories.isError || getShopOpen.isError || me.isError || ads.isError || meCanOrder.isError || quota.isError || totalQuota.isError ||
        (typeof categories.data === 'object' && 'detail' in categories.data) || (typeof me.data === 'object' && 'detail' in me.data) ||
        (typeof quota.data === 'object' && 'detail' in quota.data) || typeof totalQuota.data === 'object' ||
        typeof singleQuota.data === 'object' || (typeof meCanOrder.data === 'object' && 'detail' in meCanOrder.data) || singleQuota.isError) {
        return <BasePage><ComponentError detail={categories} screen={true}/></BasePage>
    }

    if (categories.isPending || getShopOpen.isPending || me.isPending || ads.isPending || meCanOrder.isPending || quota.isPending ||
        totalQuota.isPending || singleQuota.isPending) {
        return <BasePage><ComponentLoading screen={true}/></BasePage>
    }

    if (me.data.blocked) {
        navigate('/blocked')
        return <></>
    }

    if (!meCanOrder.data.result && shoppingCart.getOnSiteOrderMode() === false) {
        return <BasePage>
            <div className="flex justify-center items-center w-screen lg:h-screen bg-gray-50 bg-cover bg-center"
                 style={{ backgroundImage: `url(${loginBg})` }}>
                <div className="p-8 w-full h-full lg:w-2/3 lg:h-auto bg-white rounded-3xl">
                    <div className="flex items-center mb-16">
                        <a className="skip-to-main" href="#main">{t('a11y.skipToMain')}</a>
                        <button onClick={() => {
                            navigate('/')
                        }} className="rounded-full p-1 hover:bg-gray-200 transition-colors duration-100 w-8 h-8 mr-3"
                                aria-label={t('a11y.back')}>
                            <FontAwesomeIcon icon={faArrowLeft} className="text-gray-800 text-lg"/>
                        </button>
                        <p className="font-display">{t('name')}</p>
                    </div>

                    <div id="main" className="h-full">
                        <h1 className="font-display text-3xl font-bold mb-5">{t('order.activeOrder.title')}</h1>
                        <div className="flex flex-col lg:flex-row w-full mb-5">
                            <div className="lg:w-1/2 lg:mr-3">
                                <p className="mb-1">{t('order.activeOrder.description')}</p>
                                <p className="mb-3">{t('order.activeOrder.orderInfo')}</p>
                                <Link to={`/check/${meCanOrder.data.orderId!}`}
                                      className="block hover:bg-accent-latte transition-colors duration-100 w-full bg-accent-yellow-bg rounded-3xl p-5 mb-3">
                                    <p className="font-display text-xl font-bold">{meCanOrder.data.orderNumber}</p>
                                    <p className="text-sm">{meCanOrder.data.orderDate!.substring(0, 10)}</p>
                                    <p className="text-lg font-display">¥{meCanOrder.data.orderTotalPrice}</p>
                                </Link>
                                <p className="mb-1">{t('order.activeOrder.qr')}</p>
                                <p className="text-sm text-gray-500 mb-1">{t('order.activeOrder.alreadyPaid')}</p>
                            </div>
                            <div className="lg:w-1/2 lg:ml-3">
                                <p className="mb-3 text-lg text-red-500">{t('order.activeOrder.qrInfo')}</p>
                                <div className="flex justify-center items-center">
                                    <img src={payQR} alt="QR code" className="w-full lg:w-72 rounded-3xl"/>
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex justify-center items-center">
                            <button
                                className="w-full max-w-96 rounded-full bg-blue-500 hover:bg-blue-600 hover:shadow-lg
                     transition-colors duration-100 p-2 text-white mb-8"
                                onClick={() => {
                                    navigate('/')
                                }}>
                                {t('order.back')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </BasePage>
    }

    if (getShopOpen.data === '0' || typeof getShopOpen.data === 'object') {
        return <FullScreenMessage title={t('order.notOpenTitle')} description={t('order.notOpenDescription')}/>
    }

    const totalQuotaInt = parseInt(totalQuota.data ?? 999)
    if (quota.data.onlineToday + quota.data.onSiteToday >= totalQuotaInt) {
        return <FullScreenMessage title={t('order.quotaTitle')} description={t('order.quotaDescription', {
            count: quota.data.onlineToday + quota.data.onSiteToday,
            quota: totalQuotaInt
        })}/>
    }

    const singleQuotaInt = parseInt(singleQuota.data ?? 999)

    const resultedCategories = categories.data

    return (
        <BasePage>
            <ComponentOrderConfirmModal open={confirmModalOpen} close={() => {
                setConfirmModalOpen(false)
            }}/>

            <div className="lg:hidden flex flex-col h-screen">
                <div className="flex-shrink">
                    <ComponentTopBar/>
                </div>

                <div className="flex flex-grow min-h-0 relative bg-accent-latte">
                    <div
                        className={`absolute z-[200] top-0 left-0 w-full h-full transition-opacity duration-100 ${pickItem == null ? 'opacity-0 pointer-events-none' : ''}`}>
                        <ComponentItemDetails item={pickItem} close={() => {
                            setPickItem(null)
                        }}/>
                    </div>

                    <div className="h-full" style={{ flexShrink: '0' }}>
                        <ComponentCategories categories={resultedCategories}
                                             ids={resultedCategories.map(category => `category-m-${category.id}`)}/>
                    </div>
                    <div className="flex-grow h-full overflow-y-auto p-5" id="main">
                        <h1 className="text-2xl font-display font-bold mb-5">{t('navbar.order')}</h1>

                        <div className="h-40 mb-8">
                            <ComponentAd ads={ads.data}/>
                        </div>

                        {resultedCategories.map(category =>
                            <div key={category.id} className="mb-8" id={`category-m-${category.id}`}>
                                <ComponentCategory category={category} pickItem={(item) => {
                                    setPickItem(item)
                                }}/>
                            </div>)}
                    </div>
                </div>

                <div className="flex-shrink w-full">
                    <ComponentShoppingCart singleQuota={singleQuotaInt} order={() => {
                        if (shoppingCart.getTotalItems() > 0) {
                            setConfirmModalOpen(true)
                        }
                    }}/>
                </div>
            </div>

            <div className="hidden lg:flex h-screen flex-col">
                <div className="flex-shrink">
                    <ComponentCategories categories={resultedCategories}
                                         ids={resultedCategories.map(category => `category-d-${category.id}`)}/>
                </div>
                <div className="flex flex-grow min-h-0 relative bg-accent-latte">
                    <div
                        className={`absolute top-0 left-0 overflow-y-scroll w-[calc(50%_-_1px)] max-h-full transition-opacity duration-100 ${pickItem == null ? 'opacity-0 pointer-events-none' : ''}`}>
                        <ComponentItemDetails item={pickItem} close={() => {
                            setPickItem(null)
                        }}/>
                    </div>

                    <div className="w-1/2 border-r border-gray-300 border-solid h-full overflow-y-auto p-16" id="main">
                        <h1 className="text-4xl mb-8 font-display font-bold">{t('navbar.order')}</h1>

                        {resultedCategories.map(category => <div key={category.id}
                                                                 className="mb-8"
                                                                 id={`category-d-${category.id}`}>
                            <ComponentCategory category={category} pickItem={(item) => {
                                setPickItem(item)
                            }}/>
                        </div>)}
                    </div>
                    <div className="w-1/2 h-full p-8 xl:p-12 2xl:px-24 2xl:py-16">
                        <div className="flex flex-col h-full">
                            <div className="h-64 lg:h-2/5 mb-5">
                                <ComponentAd ads={ads.data}/>
                            </div>
                            <div className="lg:h-3/5">
                                <ComponentShoppingCart singleQuota={singleQuotaInt} order={() => {
                                    if (shoppingCart.getTotalItems() > 0) {
                                        setConfirmModalOpen(true)
                                    }
                                }}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BasePage>
    )
}
