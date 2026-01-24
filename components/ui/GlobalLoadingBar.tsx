import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingBarProps {
    isLoading: boolean;
}

export const GlobalLoadingBar: React.FC<LoadingBarProps> = ({ isLoading }) => {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[9999] h-[3px]"
                >
                    {/* Animated progress bar */}
                    <motion.div
                        initial={{ width: '0%', opacity: 1 }}
                        animate={{
                            width: ['0%', '30%', '70%', '90%'],
                            transition: {
                                duration: 5,
                                times: [0, 0.2, 0.5, 1],
                                ease: "easeOut"
                            }
                        }}
                        className="h-full bg-gradient-to-r from-primary via-secondary to-primary shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                    />

                    {/* Light glow effect */}
                    <div className="absolute top-0 right-0 h-full w-20 bg-white blur-md opacity-50" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
