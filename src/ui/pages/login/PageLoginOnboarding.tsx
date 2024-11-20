import { useNavigate, useSearchParams } from 'react-router-dom'
import BasePage from '../../../BasePage.tsx'
import { useTranslation } from 'react-i18next'
import { type PersistentStorage, usePersistentStorage } from '../../../data/persistentStorage.tsx'

import loginBg from './assets/login-bg.webp'
import { redirectToLogin } from '../../../utils.ts'

export default function PageLoginOnboarding(): JSX.Element {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const persistentStorage: PersistentStorage = usePersistentStorage()

    if (searchParams.has('error') || !searchParams.has('token')) {
        return <BasePage>
            <div className="flex justify-center items-center w-screen h-screen bg-cover bg-center"
                 style={{ backgroundImage: `url(${loginBg})` }}>
                <div className='p-8 w-full h-full lg:w-1/2 xl:w-1/3 2xl:w-1/4 lg:h-auto bg-white rounded-3xl'>
                    <h1 className='font-display text-3xl font-bold mb-1'>{t('login.title')}</h1>
                    <p className='text-sm mb-5'>
                        {t('login.onboarding.error')}
                    </p>

                    <p className='text-xs text-gray-400 mb-5'>{t('login.privacy')}</p>
                    <button
                        className='w-full rounded-full bg-blue-500 hover:bg-blue-600 hover:shadow-lg
                 transition-colors duration-100 p-2 text-white mb-8'
                        onClick={() => {
                            redirectToLogin()
                        }}>
                        {t('login.onboarding.tryAgain')}
                    </button>
                </div>
            </div>
        </BasePage>
    }

    persistentStorage.setToken(searchParams.get('token'))
    navigate('/')
    return <div></div>
}
