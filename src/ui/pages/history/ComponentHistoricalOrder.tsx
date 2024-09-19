import { useTranslation } from 'react-i18next'
import { type OrderSchema } from '../../../data/dataTypes'
import { useNavigate } from 'react-router-dom'
import { getUploadsRoot } from '../../../utils.ts'

export default function ComponentHistoricalOrder({ order }: { order: OrderSchema }): JSX.Element {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <button onClick={() => { navigate(`/check/${order.id}`) }}
                className="bg-accent-yellow-bg hover:bg-accent-orange-bg transition-colors duration-100 rounded-3xl w-full p-4 flex items-center mb-3 text-left h-24">
            <img
                src={`${getUploadsRoot()}/${order.items[0].itemType.image}`}
                alt={order.items[0].itemType.name} className="w-16 h-16 rounded-full object-cover object-center mr-5"/>
            <div className='w-full'>
                <p className='text-xl font-bold font-display'>{order.number}</p>
                <div className='flex items-center w-full'>
                    <p className='text-xs flex-grow mr-2'>{t(`history.status.${order.status.toString()}_${order.type}`)}</p>
                    <p className='flex-shrink font-bold font-display'>¥{order.totalPrice}</p>
                </div>
            </div>
        </button>
    )
}
