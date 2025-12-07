import "./css/skeleton.css"

export default function InputSkeleton() {
    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Input con efecto de shimmer (brillo que se mueve) */}
            <div className="relative w-full h-10 bg-custom-gray-semiLight rounded-full overflow-hidden">
                <div className="absolute inset-0 skeleton-shimmer"></div>
            </div>
        </div>
    )
}