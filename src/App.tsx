import { Route, Routes, useLocation } from 'react-router-dom'
import PageHome from './ui/pages/home/PageHome.tsx'
import PageOrder from './ui/pages/order/PageOrder.tsx'
import { AnimatePresence } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShoppingCartProvider } from './data/shoppingCart.tsx'
import PageCheck from './ui/pages/check/PageCheck.tsx'
import { PersistentStorageProvider } from './data/persistentStorage.tsx'
import PageLoginOnboarding from './ui/pages/login/PageLoginOnboarding.tsx'
import PageHistory from './ui/pages/history/PageHistory.tsx'
import PageAccount from './ui/pages/account/PageAccount.tsx'
import PageManage from './ui/pages/manage/PageManage.tsx'
import PageStats from './ui/pages/stats/PageStats.tsx'
import PageBlocked from './ui/pages/blocked/PageBlocked.tsx'

const queryClient = new QueryClient()

export default function App(): JSX.Element {
    const location = useLocation()

    return (
        <AnimatePresence mode="wait">
            <QueryClientProvider client={queryClient}>
                <ShoppingCartProvider>
                    <PersistentStorageProvider>
                        <Routes location={location} key={location.pathname}>
                            <Route index element={<PageHome/>}/>
                            <Route path="order" element={<PageOrder/>}/>
                            <Route path="login/onboarding" element={<PageLoginOnboarding/>}/>
                            <Route path="check/:id" element={<PageCheck/>}/>
                            <Route path="history" element={<PageHistory/>}/>
                            <Route path="account" element={<PageAccount/>}/>
                            <Route path="manage" element={<PageManage/>}/>
                            <Route path="statistics" element={<PageStats/>}/>
                            <Route path="blocked" element={<PageBlocked/>}/>
                        </Routes>
                    </PersistentStorageProvider>
                </ShoppingCartProvider>
            </QueryClientProvider>
        </AnimatePresence>
    )
}
