import desktopDeco from './assets/desktop-decoration.webp'
import mobileDeco from './assets/mobile-decoration.webp'
import ComponentPickupButton from './ComponentPickupButton.tsx'
import ComponentHistoryButton from './ComponentHistoryButton.tsx'
import ComponentHomeStatus from './ComponentHomeStatus.tsx'
import { Trans, useTranslation } from 'react-i18next'
import BasePage from '../../../BasePage.tsx'
import ComponentBottomNav from '../../common/ComponentBottomNav.tsx'
import ComponentAccountButton from './ComponentAccountButton.tsx'

export default function PageHome(): JSX.Element {
    const { t } = useTranslation()

    return (
        <BasePage>
            <div className="block lg:hidden h-screen bg-accent-latte">
                <div className="top-0 left-0 absolute h-[50vh] bg-cover w-full"
                     style={{ backgroundImage: `url(${mobileDeco})` }}></div>
                <div className='w-full px-3 translate-y-[40vh] flex justify-center items-center flex-col'>
                    <div
                        className='grid grid-cols-2 grid-rows-1 place-content-center w-full bg-white rounded-3xl shadow-xl p-8 mb-5'>
                        <ComponentPickupButton />
                        <ComponentHistoryButton />
                    </div>

                    <div className='bg-white rounded-3xl shadow-md w-full'>
                        <ComponentHomeStatus />
                    </div>
                </div>
                <ComponentBottomNav />
            </div>

            <div className='hidden lg:block bg-accent-latte'>
                <div className='absolute select-none w-screen top-0 left-0 h-[30vh] flex justify-center items-center'
                     aria-hidden={true}>
                    <p className='text-[7rem] xl:text-[10rem] bg-clip-text text-transparent from-[#401f1022] to-[#401f1000] bg-gradient-to-b
                                    font-bold font-display'>{t('home.backgroundText')}</p>
                </div>
                <div className='2xl:px-96 xl:px-48 lg:px-24 py-16 h-[50vh] grid grid-rows-1 grid-cols-2 gap-x-10'>
                    <div className='flex flex-col justify-center z-10'>
                        <h1 className='mb-5 font-bold lg:text-5xl xl:text-6xl text-accent-brown'>
                            <Trans i18nKey='home.title' components={{ 1: <br /> }} />
                        </h1>
                        <p className='text-sm'>
                            <Trans i18nKey='home.description' components={{ 1: <br /> }} />
                        </p>
                    </div>

                    <div className='flex justify-center items-center z-10'>
                        <img src={desktopDeco} role='presentation' alt=''
                             className="rounded-3xl w-64 xl:w-72 object-cover h-80 xl:h-96"/>
                    </div>
                </div>

                <div className='2xl:px-96 xl:px-48 lg:px-24 py-8 flex flex-col justify-center h-[50vh] bg-accent-brown'>
                    <h2 className='text-center font-bold text-3xl xl:text-4xl text-white mb-8'>
                        {t('home.startOrdering')}
                    </h2>
                    <div className='flex justify-center items-center'>
                        <div className='w-48 h-48 flex justify-center items-center bg-white rounded-3xl mr-8'>
                            <ComponentPickupButton />
                        </div>

                        <div className='w-48 h-48 flex justify-center items-center bg-white rounded-3xl mr-8'>
                            <ComponentHistoryButton />
                        </div>

                        <div className='w-48 h-48 flex justify-center items-center bg-white rounded-3xl'>
                            <ComponentAccountButton />
                        </div>

                        <div className='ml-8 h-48 flex justify-center items-center bg-white rounded-3xl'>
                            <ComponentHomeStatus />
                        </div>
                    </div>
                </div>
            </div>
        </BasePage>
    )
}
