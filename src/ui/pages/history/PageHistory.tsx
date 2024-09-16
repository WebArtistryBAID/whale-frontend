import { useTranslation } from 'react-i18next'
import BasePage from '../../../BasePage.tsx'
import ComponentBottomNav from '../../common/ComponentBottomNav'
import ComponentTopBar from '../../common/ComponentTopBar'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getOrders } from '../../../data/api.ts'
import { type PersistentStorage, usePersistentStorage } from '../../../data/persistentStorage.tsx'
import ComponentLoading from '../../common/ComponentLoading.tsx'
import ComponentError from '../../common/ComponentError.tsx'
import ComponentHistoricalOrder from './ComponentHistoricalOrder.tsx'
import React, { useEffect } from 'react'
import { faMugSaucer, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate } from 'react-router-dom'

export default function PageHistory(): JSX.Element {
    const { t } = useTranslation()
    const persistentStorage: PersistentStorage = usePersistentStorage()
    const navigate = useNavigate()

    const query = useInfiniteQuery({
        queryKey: ['user-orders'],
        queryFn: async ({ pageParam }) => await getOrders(pageParam, persistentStorage.getToken()!),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if ('detail' in lastPage || lastPage.page >= lastPage.pages) {
                return null
            }
            return lastPage.page + 1
        }
    })

    useEffect(() => {
        if (persistentStorage.getToken() == null) {
            navigate('/login/oauth2/_history')
        }
    }, [])

    if (query.isPending) {
        return <ComponentLoading screen={true} />
    }

    if (query.isError) {
        return <ComponentError detail={query} screen={true} />
    }

    let hasItems = false
    for (const page of query.data.pages) {
        if (!('detail' in page) && page.items.length > 0) {
            hasItems = true
            break
        }
    }

    return (
        <BasePage>
            <div className='lg:hidden flex flex-col h-screen bg-accent-latte'>
                <div className='flex-shrink'>
                    <ComponentTopBar />
                </div>

                <div id='main' className='flex flex-col flex-grow h-full min-h-0 overflow-y-auto relative px-6'>
                    <h1 className='text-2xl font-display font-bold my-5'>{t('navbar.history')}</h1>

                    {query.data.pages.map((page, i) => (
                        <React.Fragment key={i}>
                            {(page != null && !('detail' in page))
                                ? page.items.map((order, index) => (
                                    <ComponentHistoricalOrder order={order} key={index} />
                                ))
                                : null}
                        </React.Fragment>
                    ))}

                    {!hasItems
                        ? <div className='w-full h-full flex flex-col justify-center items-center'>
                            <FontAwesomeIcon icon={faMugSaucer} className='text-4xl text-gray-400 mb-3' />
                            <p className="text-lg mb-1">{t('order.empty')}</p>
                        </div>
                        : null}
                </div>
                <ComponentBottomNav />
            </div>

            <div className='hidden lg:flex h-screen flex-col bg-accent-latte'>
                <div className='flex-shrink'>
                    <ComponentTopBar />
                </div>
                <div id="main"
                     className="flex flex-grow min-h-0 flex-col h-full overflow-y-auto px-12 xl:px-48 2xl:px-96 py-12">
                    <h1 className='text-4xl mb-8 font-display font-bold'>{t('navbar.history')}</h1>

                    <div className="w-full mb-3">
                        <div className='grid grid-cols-2 xl:grid-cols-3 gap-x-3 gap-y-1'>
                            {query.data.pages.map((page, i) => (
                                <React.Fragment key={i}>
                                    {(page != null && !('detail' in page))
                                        ? page.items.map((order, index) => (
                                            <ComponentHistoricalOrder order={order} key={index} />
                                        ))
                                        : null}
                                </React.Fragment>
                            ))}
                        </div>

                        {!hasItems
                            ? <div className='w-96 flex flex-col justify-center items-center'>
                                <FontAwesomeIcon icon={faMugSaucer} className='text-4xl text-gray-400 mb-3' />
                                <p className="text-lg mb-1">{t('order.empty')}</p>
                            </div>
                            : null}
                    </div>

                    {query.isFetchingNextPage
                        ? <div className='flex justify-center items-center mb-3'><FontAwesomeIcon icon={faSpinner}
                                                                                                  aria-label={t('a11y.loading')}
                                                                                                  className="text-4xl text-gray-400"
                                                                                                  spin={true}/></div>
                        : null}

                    {query.hasNextPage && !query.isFetchingNextPage
                        ? <div className='flex justify-center items-center'>
                            <button onClick={() => {
                                void query.fetchNextPage()
                            }}
                                    className="rounded-full py-2 px-5 bg-accent-yellow-bg hover:bg-accent-orange-bg transition-colors duration-100">{t('history.loadMore')}</button>
                        </div>
                        : null
                    }
                </div>
            </div>
        </BasePage>
    )
}
