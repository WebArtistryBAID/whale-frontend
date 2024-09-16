import { motion } from 'framer-motion'
import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export default function BasePage({ children }: { children: ReactNode }): JSX.Element {
    const { t } = useTranslation()

    return (
        <motion.main
            className='main-animation'>
            {children}
            {import.meta.env.VITE_TESTING === '1'
                ? (
                    <div
                        className='absolute z-50 top-0 lg:top-[initial] lg:bottom-0 w-screen p-1 text-white font-bold bg-accent-red text-center'>
                        {t('a11y.testing')}
                    </div>
                )
                : null}
        </motion.main>
    )
}
