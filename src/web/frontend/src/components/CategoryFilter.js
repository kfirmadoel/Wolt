// src/components/CategoryFilter.js
import React, { useRef } from 'react';
import '../css/CategoryFilter.css';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: '🍽️' },
    { id: 'burger', label: 'Burgers', icon: '🍔' },
    { id: 'pizza', label: 'Pizza', icon: '🍕' },
    { id: 'sushi', label: 'Sushi', icon: '🍣' },
    { id: 'asian', label: 'Asian', icon: '🍜' },
    { id: 'bakery', label: 'Bakery', icon: '🥐' },
    { id: 'salad', label: 'Salads', icon: '🥗' },
    { id: 'dessert', label: 'Desserts', icon: '🍰' },
    { id: 'mexican', label: 'Mexican', icon: '🌮' },
    { id: 'drinks', label: 'Drinks', icon: '🥤' },
    { id: 'grocery', label: 'Grocery', icon: '🛒' }
];

function CategoryFilter({ selectedCategory, onSelectCategory }) {
    const scrollContainerRef = useRef(null);

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
                {CATEGORIES.map((cat) => {
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

