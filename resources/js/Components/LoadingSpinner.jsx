/**
 * v0 by Vercel.
 * @see https://v0.dev/t/Z956b6i7k7g
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
export function LoadingSpinner({ className, text = 'Loading...' }) {
    return (
        <div className="flex w-full items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className={`animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12 ` + className} />
                <p className="text-gray-500 dark:text-gray-400">{text}</p>
            </div>
        </div>
    )
}