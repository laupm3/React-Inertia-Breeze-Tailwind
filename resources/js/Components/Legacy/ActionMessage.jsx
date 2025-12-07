import {
    Transition,
} from '@headlessui/react';

export default function ActionMessage({ on = false, children }) {
    return (
        <Transition
            show={on}
            enter='transition ease-in duration-200'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='transition ease-out duration-1000'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
        >
            <div className="text-sm text-gray-600 dark:text-gray-400">
                {children}
            </div>
        </Transition>
    )
}