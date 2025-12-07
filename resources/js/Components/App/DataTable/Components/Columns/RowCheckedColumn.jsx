import { Check } from 'lucide-react'

export const rowCheckedColumn = {
    id: 'select',
    cell: ({ row }) => (
        <div className="flex items-center justify-center w-4">
            {row.getIsSelected() && (
                <Check className="w-4 h-4" />
            )}
        </div>
    ),
    enableSorting: false,
    enableHiding: false,
}