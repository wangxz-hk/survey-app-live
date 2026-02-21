import { ReactNode } from 'react';

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
    return <div className={`card ${className}`}>{children}</div>;
};
