import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { type PersistentStorage, usePersistentStorage } from '../../../data/persistentStorage.tsx'
import { useNavigate } from 'react-router-dom'
import { redirectToLogin } from '../../../utils.ts'

export default function ComponentAccountButton(): JSX.Element {
    const { t } = useTranslation()
    const persistentStorage: PersistentStorage = usePersistentStorage()
    const navigate = useNavigate()

    return (
        <button className='flex justify-center items-center flex-col rounded-3xl w-full h-full
                            px-3 py-5 bg-white hover:bg-gray-100 transition-colors duration-100'
                onClick={() => {
                    if (persistentStorage.getToken() == null) {
                        redirectToLogin()
                        return
                    }
                    navigate('/account')
                }}>
            <FontAwesomeIcon icon={faUser} className='text-blue-500 mb-3 text-5xl' />

            <p className='font-bold text-xl font-display mb-0.5'>
                {t('home.account.name')}
            </p>

            <p className='text-gray-400 text-xs'>
                {t('home.account.description')}
            </p>
        </button>
    )
}
