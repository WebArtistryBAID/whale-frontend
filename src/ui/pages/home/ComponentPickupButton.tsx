import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMugHot } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { type PersistentStorage, usePersistentStorage } from '../../../data/persistentStorage.tsx'
import { redirectToLogin } from '../../../utils.ts'

export default function ComponentPickupButton(): JSX.Element {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const persistentStorage: PersistentStorage = usePersistentStorage()

    return (
        <button className='flex justify-center items-center flex-col rounded-3xl w-full h-full
                            px-3 py-5 bg-white hover:bg-gray-100 transition-colors duration-100'
                onClick={() => {
                    if (persistentStorage.getToken() == null) {
                        redirectToLogin()
                        return
                    }
                    navigate('/order')
                }}>
            <FontAwesomeIcon icon={faMugHot} className='text-accent-red mb-3 text-5xl' />

            <p className='font-bold text-xl font-display mb-0.5'>
                {t('home.pickUp.name')}
            </p>

            <p className='text-gray-400 text-xs'>
                {t('home.pickUp.description')}
            </p>
        </button>
    )
}
