import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import BasePage from '../../../BasePage.tsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import { type PersistentStorage, usePersistentStorage } from '../../../data/persistentStorage.tsx'

export default function PageLoginOnboarding(): JSX.Element {
    const { redirect } = useParams()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const persistentStorage: PersistentStorage = usePersistentStorage()

    if (searchParams.has('error') || !searchParams.has('token')) {
        return <BasePage>
            <div className='flex justify-center items-center w-screen h-screen bg-gray-50'>
                <div className='p-8 w-full h-full lg:w-1/2 xl:w-1/3 2xl:w-1/4 lg:h-auto bg-white rounded-3xl'>
                    <div className='flex items-center mb-16'>
                        <button onClick={() => {
                            navigate('/')
                        }} className='rounded-full p-1 hover:bg-gray-200 transition-colors duration-100 w-8 h-8 mr-3'
                                aria-label={t('a11y.back')}>
                            <FontAwesomeIcon icon={faArrowLeft} className='text-gray-800 text-lg' />
                        </button>
                        <img src='https://passport.seiue.com/img/seiue.png' alt='Seiue Account' className='h-6 mr-3' />
                        <p className='font-display'>{t('login.baid')}</p>
                    </div>
                    <h1 className='font-display text-3xl font-bold mb-1'>{t('login.title')}</h1>
                    <p className='text-sm mb-5'>
                        {t('login.onboarding.error')}
                    </p>

                    <p className='text-xs text-gray-400 mb-5'>{t('login.privacy')}</p>
                    <button
                        className='w-full rounded-full bg-blue-500 hover:bg-blue-600 hover:shadow-lg
                 transition-colors duration-100 p-2 font-display text-white mb-8'
                        onClick={() => {
                            navigate(`/login/oauth2/${redirect}`)
                        }}>
                        {t('login.onboarding.tryAgain')}
                    </button>
                </div>
            </div>
        </BasePage>
    }

    persistentStorage.setToken(searchParams.get('token'))

    return <BasePage>
        <div className='flex justify-center items-center w-screen h-screen bg-gray-50'>
            <div className='p-8 w-full h-full lg:w-1/2 xl:w-1/3 2xl:w-1/4 lg:h-auto bg-white rounded-3xl'>
                <div className='flex items-center mb-16'>
                    <a className='skip-to-main' href='#main'>{t('a11y.skipToMain')}</a>
                    <button onClick={() => {
                        navigate('/')
                    }} className='rounded-full p-1 hover:bg-gray-200 transition-colors duration-100 w-8 h-8 mr-3'
                            aria-label={t('a11y.back')}>
                        <FontAwesomeIcon icon={faArrowLeft} className='text-gray-800 text-lg' />
                    </button>
                    <img src='https://passport.seiue.com/img/seiue.png' alt='Seiue Account' className='h-6 mr-3' />
                    <p className='font-display'>{t('login.baid')}</p>
                </div>
                <div id='main'>
                    <h1 className='font-display text-3xl font-bold mb-1'>{t('login.onboarding.welcome')}</h1>
                    <p className='text-sm mb-5'>
                        {t('login.onboarding.welcomeMessage', { name: searchParams.get('name') })}
                    </p>
                    <p className='text-xs text-gray-400 mb-5'>{t('login.privacy')}</p>

                    <button
                        className='w-full rounded-full bg-blue-500 hover:bg-blue-600 hover:shadow-lg
                     transition-colors duration-100 p-2 font-display text-white mb-8'
                        onClick={() => {
                            navigate(redirect!.replace(/_/g, '/'))
                        }}>
                        {t('login.onboarding.continue')}
                    </button>
                </div>
            </div>
        </div>
    </BasePage>
}
