'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
    size?: 'default' | 'sm' | 'lg' | 'icon';
    variant?: 'default' | 'outline' | 'ghost';
    className?: string;
}

export function ThemeToggle({ size = 'sm', variant = 'outline', className = '' }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleToggle = () => {
        try {
            toggleTheme();
        } catch (error) {
            console.warn('Theme toggle error:', error);
        }
    };

    // Don't render anything until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <Button
                variant={variant}
                size={size}
                className={`relative overflow-hidden ${className}`}
                disabled
            >
                <Sun className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleToggle}
            className={`relative overflow-hidden ${className}`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <motion.div
                initial={false}
                animate={{
                    scale: theme === 'light' ? 1 : 0,
                    opacity: theme === 'light' ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <Sun className="h-4 w-4" />
            </motion.div>

            <motion.div
                initial={false}
                animate={{
                    scale: theme === 'dark' ? 1 : 0,
                    opacity: theme === 'dark' ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <Moon className="h-4 w-4" />
            </motion.div>

            {/* Invisible content to maintain button size */}
            <div className="opacity-0">
                <Sun className="h-4 w-4" />
            </div>
        </Button>
    );
}