import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { type PersistentStorage, usePersistentStorage } from '../../../data/persistentStorage.tsx'
import { useNavigate } from 'react-router-dom'
import { redirectToLogin } from '../../../utils.ts'

export default function ComponentHistoryButton(): JSX.Element {
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
                    navigate('/history')
                }}>
            <FontAwesomeIcon icon={faClock} className='text-accent-orange mb-3 text-5xl' />

            <p className='font-bold text-xl font-display mb-0.5'>
                {t('home.history.name')}
            </p>

            <p className='text-gray-400 text-xs'>
                {t('home.history.description')}
            </p>
        </button>
    )
}
