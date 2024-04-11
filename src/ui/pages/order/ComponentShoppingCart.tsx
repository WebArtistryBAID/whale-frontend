import { type OrderedItem } from '../../../data/dataTypes.ts'
import ComponentOrderedItem from './ComponentOrderedItem.tsx'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { frontendCalculate } from '../../../utils.ts'

export default function ComponentShoppingCart(): JSX.Element {
    const [amount, setAmount] = useState(3)
    const { t } = useTranslation()

    const mockOrderedItem: OrderedItem = {
        id: 1,
        itemType: {
            id: 8,
            category: {
                id: 1,
                name: 'Drinks'
            },
            name: 'Test3',
            image: 'https://cdn.loveandlemons.com/wp-content/uploads/2023/06/iced-matcha-latte.jpg',
            tags: [],
            shortDescription: 'Lorem ipsum sit dolor amit. Lorem ipsum sit dolor amit.',
            description: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            options: [],
            basePrice: 10,
            salePercent: 0.8
        },
        appliedOptions: [
            {
                id: 1,
                name: 'Lemon',
                type: {
                    id: 1,
                    name: 'Added Fruits',
                    default: 1
                },
                priceChange: 1
            }
        ],
        amount
    }

    return (
        <div className='w-full h-full flex flex-col'>
            <p className='font-display mb-3 flex-shrink'>{t('order.shoppingCart')}</p>

            <div className='bg-gray-50 flex-grow rounded-3xl flex flex-col min-h-0'>
                <div className='flex-grow overflow-y-auto py-3 px-8'>
                    <ComponentOrderedItem item={mockOrderedItem}
                                          changeAmount={(change) => {
                                              setAmount(amount + change)
                                          }} />

                </div>
                <div className='flex-shrink bg-gray-100 flex rounded-b-3xl'>
                    <div className='flex-grow flex items-center p-2'>
                        <div
                            className='shadow-xl h-12 w-12 rounded-full flex justify-center items-center bg-white p-2 font-display font-bold mr-3'>
                            {amount}
                        </div>
                        <p className='font-display'>¥{frontendCalculate(mockOrderedItem)}</p>
                    </div>
                    <button className='flex-shrink rounded-br-3xl transition-colors duration-100
                     flex h-full bg-accent-orange-bg hover:bg-amber-100 py-3 px-8 justify-center items-center'>
                        <p className='font-display'>{t('order.order')}</p>
                    </button>
                </div>
            </div>
        </div>
    )
}