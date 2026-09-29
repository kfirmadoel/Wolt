// src/components/InputField.js
import React from 'react';

function InputField({ type, placeholder, value, onChange, accept, required, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                accept={accept}
                required={required}
            />
            {children}
        </div>
    );
}

export default InputField;