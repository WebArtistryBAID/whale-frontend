import BasePage from '../../../BasePage.tsx'
import ComponentCategories from './ComponentCategories.tsx'
import ComponentCategory from './ComponentCategory.tsx'
import ComponentAd from './ComponentAd.tsx'
import ComponentShoppingCart from './ComponentShoppingCart.tsx'
import { useEffect, useState } from 'react'
import ComponentOrderConfirmModal from './ComponentOrderConfirmModal.tsx'
import { useQuery } from '@tanstack/react-query'
import { getAds, getCategories, getMe, getMeCanOrder, getSettings } from '../../../data/api.ts'
import ComponentError from '../../common/ComponentError.tsx'
import ComponentLoading from '../../common/ComponentLoading.tsx'
import { type ItemTypeSchema } from '../../../data/dataTypes.ts'
import ComponentItemDetails from './ComponentItemDetails.tsx'
import { useShoppingCart } from '../../../data/shoppingCart.tsx'
import { type PersistentStorage, usePersistentStorage } from '../../../data/persistentStorage.tsx'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ComponentTopBar from '../../common/ComponentTopBar.tsx'
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

    useEffect(() => {
        if (persistentStorage.getToken() == null) {
            navigate('/login/oauth2/_order')
        }
    }, [])

    const me = useQuery({
        queryKey: ['user-info-from-token'],
        queryFn: async () => await getMe(persistentStorage.getToken()!)
    })

    const meCanOrder = useQuery({
        queryKey: ['me-can-order'],
        queryFn: async () => await getMeCanOrder(persistentStorage.getToken()!)
    })

    if (categories.isError || getShopOpen.isError || me.isError || ads.isError || meCanOrder.isError ||
        (typeof categories.data === 'object' && 'detail' in categories.data) || (typeof me.data === 'object' && 'detail' in me.data)) {
        return <BasePage><ComponentError detail={categories} screen={true}/></BasePage>
    }

    if (categories.isPending || getShopOpen.isPending || me.isPending || ads.isPending || meCanOrder.isPending) {
        return <BasePage><ComponentLoading screen={true}/></BasePage>
    }

    if (me.data.blocked) {
        navigate('/blocked')
        return <></>
    }

    if (meCanOrder.data === false) {
        return <BasePage>
            <div className="flex justify-center items-center w-screen h-screen bg-gray-50">
                <div className="p-8 w-full h-full lg:w-1/2 xl:w-1/3 2xl:w-1/4 lg:h-auto bg-white rounded-3xl">
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
                        <h1 className="font-display text-3xl font-bold mb-1">{t('order.activeOrder.title')}</h1>
                        <p className="text-sm mb-5">
                            {t('order.activeOrder.description')}
                        </p>

                        <button
                            className="w-full rounded-full bg-blue-500 hover:bg-blue-600 hover:shadow-lg
                     transition-colors duration-100 p-2 font-display text-white mb-8"
                            onClick={() => {
                                navigate('/')
                            }}>
                            {t('order.back')}
                        </button>
                    </div>
                </div>
            </div>
        </BasePage>
    }

    if (getShopOpen.data === '0' || typeof getShopOpen.data === 'object') {
        return <BasePage>
            <div className="flex justify-center items-center w-screen h-screen bg-gray-50">
                <div className="p-8 w-full h-full lg:w-1/2 xl:w-1/3 2xl:w-1/4 lg:h-auto bg-white rounded-3xl">
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
                        <h1 className="font-display text-3xl font-bold mb-1">{t('order.notOpenTitle')}</h1>
                        <p className="text-sm mb-5">
                            {t('order.notOpenDescription')}
                        </p>

                        <button
                            className="w-full rounded-full bg-blue-500 hover:bg-blue-600 hover:shadow-lg
                     transition-colors duration-100 p-2 font-display text-white mb-8"
                            onClick={() => {
                                navigate('/')
                            }}>
                            {t('order.back')}
                        </button>
                    </div>
                </div>
            </div>
        </BasePage>
    }

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
                    <ComponentShoppingCart order={() => {
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
                                <ComponentShoppingCart order={() => {
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
