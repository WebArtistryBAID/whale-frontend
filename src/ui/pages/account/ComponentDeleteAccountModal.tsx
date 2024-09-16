import { faClose } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import { type PersistentStorage, usePersistentStorage } from '../../../data/persistentStorage'
import { useMutation } from '@tanstack/react-query'
import { deleteMe } from '../../../data/api'
import { useNavigate } from 'react-router-dom'

export default function ComponentDeleteAccountModal({ open, close, deletable }: { open: boolean, close: () => void, deletable: boolean }): JSX.Element {
    const { t } = useTranslation()
    const persistentStorage: PersistentStorage = usePersistentStorage()
    const navigate = useNavigate()

    const deleteAcc = useMutation({
        mutationFn: async () => await deleteMe(persistentStorage.getToken()!),
        onSuccess: (data) => {
            if (typeof data === 'object' && 'detail' in data) {
                close()
                return
            }
            persistentStorage.setToken(null)
            navigate('/')
        },
        onError: () => {
            close()
        }
    })

    return (
        <>
            <div className={`w-screen h-screen absolute justify-center items-center flex bg-gray-500/30
                  top-0 left-0 z-[60] transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                 role='dialog'>
                <div
                    className='z-[70] bg-white lg:shadow-lg lg:rounded-3xl w-full lg:w-1/2 2xl:w-1/3 h-full lg:h-auto overflow-y-auto'>
                    <div className='p-8 pt-12 lg:p-12'>
                        <div className='flex items-center mb-5'>
                            <h1 className='text-3xl font-bold font-display flex-grow'>{t('account.deleteConfirm.title')}</h1>
                            <button
                                className='rounded-full w-10 h-10 hover:bg-gray-50 flex-shrink transition-colors duration-100'
                                aria-label={t('a11y.close')}
                                onClick={() => {
                                    close()
                                }}>
                                <FontAwesomeIcon icon={faClose} className='text-xl' />
                            </button>
                        </div>

                        <p>{deletable ? t('account.deleteConfirm.description') : t('account.deleteConfirm.unavailable')}</p>
                    </div>

                    <div className='fixed lg:sticky w-full bg-gray-100 bottom-0 flex'>
                        {deletable
                            ? (
                                <>
                                    <button className='w-1/2 lg:rounded-bl-3xl transition-colors duration-100
                                flex bg-gray-100 hover:bg-gray-200 py-3 px-8 justify-center items-center' onClick={() => { close() }}>
                                        <p>{t('account.deleteConfirm.cancel')}</p>
                                    </button>
                                    <button className='w-1/2 lg:rounded-br-3xl transition-colors duration-100
                            flex bg-accent-orange-bg hover:bg-amber-100 py-3 px-8 justify-center items-center' onClick={() => { deleteAcc.mutate() }}>
                                        <p>{t('account.deleteConfirm.confirm')}</p>
                                    </button>
                                </>
                            )
                            : (
                                <button className='w-full lg:rounded-b-3xl transition-colors duration-100
                                flex bg-gray-100 hover:bg-gray-200 py-3 px-8 justify-center items-center' onClick={() => { close() }}>
                                    <p>{t('account.deleteConfirm.cancel')}</p>
                                </button>
                            )}

                    </div>
                </div>
            </div>
        </>
    )
}
