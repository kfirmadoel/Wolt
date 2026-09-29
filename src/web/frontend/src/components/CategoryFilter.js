// src/components/CategoryFilter.js
import React, { useRef } from 'react';
import '../css/CategoryFilter.css';

export const CATEGORY_ICONS = {
    All: '🍽️',
    Burgers: '🍔',
    Pizza: '🍕',
    Sushi: '🍣',
    Asian: '🍜',
    Bakery: '🥐',
    Salads: '🥗',
    Desserts: '🍰',
    Mexican: '🌮',
    Drinks: '🥤',
    Grocery: '🛒'
};

function CategoryFilter({ categories = [], selectedCategory, onSelectCategory }) {
    const scrollContainerRef = useRef(null);
    const categoryOptions = [
        { id: 'all', label: 'All', icon: CATEGORY_ICONS.All },
        ...categories.map((category) => ({
            id: category,
            label: category,
            icon: CATEGORY_ICONS[category] || '🍽️'
        }))
    ];

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const offset = direction === 'left' ? -260 : 260;
            scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    return (
        <div className="category-filter-wrapper">
            <button
                type="button"
                className="category-scroll-btn left"
                onClick={() => scroll('left')}
                title="Scroll left"
            >
                ‹
            </button>

            <div className="category-scroll-container" ref={scrollContainerRef}>
                {categoryOptions.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            className={`category-pill ${isActive ? 'active' : ''}`}
                            onClick={() => onSelectCategory(cat.id)}
                        >
                            <span className="category-icon">{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                className="category-scroll-btn right"
                onClick={() => scroll('right')}
                title="Scroll right"
            >
                ›
            </button>
        </div>
    );
}

export default CategoryFilter;

