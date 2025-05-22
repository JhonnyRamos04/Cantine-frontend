export const Category = ({ categories, activeCategory, onCategoryChange }) => {
    return (
        <div className="flex rounded-lg overflow-hidden">
            {categories.map((category) => (
                <button
                    key={category}
                    className={`px-6 py-2 text-sm font-medium transition-colors ${activeCategory === category ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                    onClick={() => onCategoryChange && onCategoryChange(category)}
                >
                    {category}
                </button>
            ))}
        </div>
    )
}
