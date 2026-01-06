import React, { useState, useEffect, useRef, useCallback } from 'react';

const RangeSlider = ({ min, max, value, onChange, step = 1, debounceMs = 300 }) => {
    const [localValue, setLocalValue] = useState(value);
    const [isDragging, setIsDragging] = useState(null);
    const sliderRef = useRef(null);
    const debounceTimerRef = useRef(null);

    // Update local value when prop changes
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Debounced onChange callback
    const debouncedOnChange = useCallback((newValue) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
            onChange(newValue);
        }, debounceMs);
    }, [onChange, debounceMs]);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const getPercentage = (val) => {
        return ((val - min) / (max - min)) * 100;
    };

    const getValueFromPosition = (clientX) => {
        if (!sliderRef.current) return min;
        
        const rect = sliderRef.current.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        let newValue = min + (percentage / 100) * (max - min);
        
        // Round to step
        newValue = Math.round(newValue / step) * step;
        
        // Ensure within bounds
        return Math.max(min, Math.min(max, newValue));
    };

    const handleMouseDown = (handle) => (e) => {
        e.preventDefault();
        setIsDragging(handle);
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        
        const newValue = getValueFromPosition(e.clientX);
        
        if (isDragging === 'min') {
            const newMin = Math.min(newValue, localValue.max - step);
            const updatedValue = { ...localValue, min: newMin };
            setLocalValue(updatedValue);
            debouncedOnChange(updatedValue);
        } else if (isDragging === 'max') {
            const newMax = Math.max(newValue, localValue.min + step);
            const updatedValue = { ...localValue, max: newMax };
            setLocalValue(updatedValue);
            debouncedOnChange(updatedValue);
        }
    }, [isDragging, localValue, min, max, step, debouncedOnChange]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(null);
            // Trigger immediate onChange on mouse up
            onChange(localValue);
        }
    }, [isDragging, localValue, onChange]);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging || !e.touches[0]) return;
        
        const newValue = getValueFromPosition(e.touches[0].clientX);
        
        if (isDragging === 'min') {
            const newMin = Math.min(newValue, localValue.max - step);
            const updatedValue = { ...localValue, min: newMin };
            setLocalValue(updatedValue);
            debouncedOnChange(updatedValue);
        } else if (isDragging === 'max') {
            const newMax = Math.max(newValue, localValue.min + step);
            const updatedValue = { ...localValue, max: newMax };
            setLocalValue(updatedValue);
            debouncedOnChange(updatedValue);
        }
    }, [isDragging, localValue, min, max, step, debouncedOnChange]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

    const minPercentage = getPercentage(localValue.min);
    const maxPercentage = getPercentage(localValue.max);

    return (
        <div className="w-full px-2 py-4">
            {/* Slider Track */}
            <div
                ref={sliderRef}
                className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
            >
                {/* Active Range */}
                <div
                    className="absolute h-2 bg-indigo-600 rounded-full"
                    style={{
                        left: `${minPercentage}%`,
                        right: `${100 - maxPercentage}%`
                    }}
                />
                
                {/* Min Handle */}
                <div
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full cursor-grab shadow-md hover:scale-110 transition-transform ${
                        isDragging === 'min' ? 'scale-110 cursor-grabbing' : ''
                    }`}
                    style={{ left: `${minPercentage}%` }}
                    onMouseDown={handleMouseDown('min')}
                    onTouchStart={handleMouseDown('min')}
                    role="slider"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={localValue.min}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const newMin = Math.max(min, localValue.min - step);
                            const updatedValue = { ...localValue, min: newMin };
                            setLocalValue(updatedValue);
                            onChange(updatedValue);
                        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            const newMin = Math.min(localValue.max - step, localValue.min + step);
                            const updatedValue = { ...localValue, min: newMin };
                            setLocalValue(updatedValue);
                            onChange(updatedValue);
                        }
                    }}
                >
                    {/* Tooltip for min value */}
                    {isDragging === 'min' && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                            ₹{Math.round(localValue.min)}
                        </div>
                    )}
                </div>
                
                {/* Max Handle */}
                <div
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full cursor-grab shadow-md hover:scale-110 transition-transform ${
                        isDragging === 'max' ? 'scale-110 cursor-grabbing' : ''
                    }`}
                    style={{ left: `${maxPercentage}%` }}
                    onMouseDown={handleMouseDown('max')}
                    onTouchStart={handleMouseDown('max')}
                    role="slider"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={localValue.max}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const newMax = Math.max(localValue.min + step, localValue.max - step);
                            const updatedValue = { ...localValue, max: newMax };
                            setLocalValue(updatedValue);
                            onChange(updatedValue);
                        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            const newMax = Math.min(max, localValue.max + step);
                            const updatedValue = { ...localValue, max: newMax };
                            setLocalValue(updatedValue);
                            onChange(updatedValue);
                        }
                    }}
                >
                    {/* Tooltip for max value */}
                    {isDragging === 'max' && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                            ₹{Math.round(localValue.max)}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Value Display */}
            <div className="flex justify-between mt-4 text-sm text-gray-600">
                <span className="font-medium">₹{Math.round(localValue.min)}</span>
                <span className="font-medium">₹{Math.round(localValue.max)}</span>
            </div>
        </div>
    );
};

export default RangeSlider;
