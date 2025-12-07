const Spinner = ({
    size = "md",
    className = "",
    color = "border-custom-orange"
}) => {
    const sizeClasses = {
        xs: "h-3 w-3 border",
        sm: "h-4 w-4 border-2",
        md: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-3",
        xl: "h-10 w-10 border-4",
    };

    return (
        <div
            className={`animate-spin rounded-full border-t-transparent ${color} ${sizeClasses[size]} ${className}`}
            role="status"
            aria-label="Cargando"
        />
    );
};

export default Spinner;