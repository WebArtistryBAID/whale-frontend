import { type OrderedItemSchema } from '../../../data/dataTypes.ts'
import { frontendCalculate, moneyRound } from '../../../utils.ts'

export default function ComponentManagedItem({
    item
}: { item: OrderedItemSchema }): JSX.Element {
    return (
        <div className="flex items-center p-4 rounded-xl">
            <div className="w-full mb-1">
                <p className="font-bold text-2xl font-display mb-1">{item.itemType.name}</p>
                <p className="text-xl text-black">{item.appliedOptions.map(option => option.name).join(' / ')}</p>
            </div>
            <div>
                <p className="text-xl">¥{moneyRound(frontendCalculate(item)).toString()}</p>
                <div className="text-3xl">
                    <p>x{item.amount}</p>
                </div>
            </div>
        </div>
    )
}
