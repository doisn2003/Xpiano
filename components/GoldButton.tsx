import React from 'react';
import styles from './Button.module.css';

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const GoldButton = React.forwardRef<HTMLButtonElement, GoldButtonProps>(({
    children,
    className = '',
    ...props
}, ref) => {
    return (
        <button
            ref={ref}
            className={`${styles.goldButton} ${className}`}
            {...props}
        >
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {children}
            </span>
        </button>
    );
});

GoldButton.displayName = 'GoldButton';
