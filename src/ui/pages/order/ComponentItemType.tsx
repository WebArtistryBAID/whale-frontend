import { type ItemTypeSchema } from '../../../data/dataTypes.ts'
import { moneyRound } from '../../../utils.ts'
import { useTranslation } from 'react-i18next'
import Decimal from 'decimal.js'
import { getUploadsRoot } from '../../../data/api.ts'

export default function ComponentItemType({
    item,
    pickItem
}: { item: ItemTypeSchema, pickItem: () => void }): JSX.Element {
    const { t } = useTranslation()

    return (
        <div
            className='cursor-pointer hover:bg-accent-yellow-bg transition-colors duration-100 flex items-center p-4 rounded-xl'
            onClick={item.soldOut
                ? () => {
                }
                : pickItem}>
            <div className='mr-5 flex-shrink'>
                <img
                    src={`${getUploadsRoot()}/${item.image}`}
                    alt={`Image of ${item.name}`}
                    className={`rounded-full w-24 aspect-square object-cover ${item.soldOut ? 'grayscale' : ''}`}/>
            </div>
            <div className='flex-grow'>
                <div className='w-full mb-2'>
                    <p className={`${item.soldOut ? 'text-gray-400' : ''} font-bold lg:text-lg font-display mb-1`}>{item.name}</p>
                    <p className='text-xs text-gray-400'>{item.shortDescription}</p>
                </div>
                <div className='flex'>
                    <p className={`${item.soldOut ? 'text-gray-400' : ''} flex-grow text-sm lg:text-base`}><span
                        className='text-[0]'>{t('a11y.price')}</span> ¥{moneyRound(new Decimal(item.basePrice).mul(item.salePercent)).toString()} {
                        item.salePercent !== 1
                            ? <span className="ml-1 line-through"><span
                                    className='text-[0]'>{t('a11y.previousPrice')}</span> {item.basePrice.toString()}</span>
                            : null}</p>
                    {item.soldOut
                        ? <button className="bg-gray-300 px-3 py-1 lg:text-sm rounded-full text-xs text-gray-800">
                            {t('order.item.soldOut')}
                        </button>
                        : <button className="bg-black px-3 py-1 font-bold hover:bg-gray-900 lg:text-sm rounded-full
                                        transition-colors duration-100 text-xs text-white">
                            {t('order.item.pick')}
                        </button>
                    }
                </div>
            </div>
        </div>
    )
}
