import { useNavigate } from 'react-router-dom'
import BasePage from '../../../BasePage.tsx'
import { useTranslation } from 'react-i18next'
import { type PersistentStorage, usePersistentStorage } from '../../../data/persistentStorage.tsx'

export default function PageBlocked(): JSX.Element {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const persistentStorage: PersistentStorage = usePersistentStorage()

    return <BasePage>
        <div className="flex justify-center items-center w-screen h-screen bg-gray-50">
            <div className="p-8 w-full h-full lg:w-1/2 xl:w-1/3 2xl:w-1/4 lg:h-auto bg-white rounded-3xl">
                <div className="flex items-center mb-16">
                    <a className="skip-to-main" href="#main">{t('a11y.skipToMain')}</a>
                    <img src="https://passport.seiue.com/img/seiue.png" alt="Seiue Account" className="h-6 mr-3"/>
                    <p className="font-display">{t('login.baid')}</p>
                </div>
                <div id="main">
                    <h1 className="font-display text-3xl font-bold mb-1">{t('blocked.title')}</h1>
                    <p className="text-sm mb-5">
                        {t('blocked.description')}
                    </p>

                    <button
                        className="w-full rounded-full bg-blue-500 hover:bg-blue-600 hover:shadow-lg
                     transition-colors duration-100 p-2 font-display text-white mb-8"
                        onClick={() => {
                            persistentStorage.setToken(null)
                            navigate('/')
                        }}>
                        {t('blocked.logOut')}
                    </button>
                </div>
            </div>
        </div>
    </BasePage>
}
