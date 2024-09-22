import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import { type UserSchema } from './dataTypes.ts'
import { jwtDecode } from 'jwt-decode'

export interface PersistentStorage {
    getCurrentOrder: () => number | null
    setCurrentOrder: (order: number | null) => void
    getToken: () => string | null
    setToken: (token: string | null) => void
    decodeToken: () => UserSchema | null
}

const PersistentStorageContext = createContext<PersistentStorage>(null as unknown as PersistentStorage)
export const usePersistentStorage = (): any => useContext(PersistentStorageContext)

export function PersistentStorageProvider({ children }: { children: ReactNode }): JSX.Element {
    const [order, setOrder] =
        useState<number | null>(localStorage.getItem('stored-order') == null ? null : parseInt(localStorage.getItem('stored-order')!))
    const [token, setTokenT] = useState<string | null>(localStorage.getItem('token'))

    useEffect(() => {
        if (order == null) {
            localStorage.removeItem('stored-order')
            localStorage.removeItem('stored-order-now')
            return
        }
        localStorage.setItem('stored-order', order.toString())
        localStorage.setItem('stored-order-now', Date.now().toString())
    }, [order])

    useEffect(() => {
        if (token == null) {
            localStorage.removeItem('token')
            return
        }
        localStorage.setItem('token', token)
    }, [token])

    function getCurrentOrder(): number | null {
        if (localStorage.getItem('stored-order-now') == null || localStorage.getItem('stored-order') == null) {
            return null
        }
        const elapsed = Date.now() - parseInt(localStorage.getItem('stored-order-now')!)
        if (elapsed >= (12 * 60 * 60 * 1000)) {
            // More than 12 hours have passed, discard this order
            setCurrentOrder(null)
            return null
        }
        return order
    }

    function getToken(): string | null {
        if (token == null) {
            return null
        }
        if (Date.now() > jwtDecode(token).exp! * 1000) {
            setToken(null)
            return null
        }
        return token
    }

    function setToken(token: string | null): void {
        setTokenT(token)
    }

    function setCurrentOrder(order: number | null): void {
        setOrder(order)
    }

    function decodeToken(): UserSchema | null {
        const token = getToken()
        if (token == null) {
            return null
        }
        const decoded = jwtDecode<any>(token)
        return {
            id: decoded.id,
            name: decoded.name,
            permissions: decoded.permissions,
            blocked: false,
            points: '0.00'
        }
    }

    return (
        <PersistentStorageContext.Provider value={{
            getCurrentOrder,
            setCurrentOrder,
            getToken,
            setToken,
            decodeToken
        }}>
            {children}
        </PersistentStorageContext.Provider>
    )
}
