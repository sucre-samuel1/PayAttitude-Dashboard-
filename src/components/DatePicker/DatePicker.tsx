import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isWithinInterval, startOfDay } from 'date-fns';
import { cn } from '../../utils/cn';

interface DatePickerProps {
    isOpen: boolean;
    onClose: () => void;
    startDate: Date | null;
    endDate: Date | null;
    onApply: (start: Date, end: Date) => void;
}

export function DatePicker({ isOpen, onClose, startDate, endDate, onApply }: DatePickerProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [viewDate, setViewDate] = useState(startDate || new Date());
    const [selectedStart, setSelectedStart] = useState<Date | null>(startDate);
    const [selectedEnd, setSelectedEnd] = useState<Date | null>(endDate);

    const handlePrevMonth = () => setViewDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setViewDate(prev => addMonths(prev, 1));

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const renderMonth = (monthDate: Date, showPrev: boolean, showNext: boolean, extraClass?: string) => {
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const days = eachDayOfInterval({ start, end });

        const startDay = getDay(start);
        const emptyDaysAtStart = startDay === 0 ? 6 : startDay - 1; // shift so Monday is 0

        return (
            <div className={cn("flex-1 text-center w-full", extraClass)} key={monthDate.toISOString()}>
                <div className="flex items-center justify-between mb-4">
                    <button onClick={handlePrevMonth} className={cn("p-1 hover:bg-gray-100 rounded", !showPrev && "invisible")}>&lt;</button>
                    <span className="font-semibold text-gray-900">{format(monthDate, 'MMMM yyyy')}</span>
                    <button onClick={handleNextMonth} className={cn("p-1 hover:bg-gray-100 rounded", !showNext && "invisible")}>&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-y-2 text-sm">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                        <div key={d} className="text-gray-400 font-medium">{d}</div>
                    ))}
                    {Array.from({ length: emptyDaysAtStart }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {days.map(day => {
                        const isStart = selectedStart && isSameDay(day, selectedStart);
                        const isEnd = selectedEnd && isSameDay(day, selectedEnd);
                        const isSelectedRange = selectedStart && selectedEnd && isWithinInterval(day, { start: startOfDay(selectedStart), end: startOfDay(selectedEnd) });

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => {
                                    if (!selectedStart || (selectedStart && selectedEnd)) {
                                        setSelectedStart(day);
                                        setSelectedEnd(null);
                                    } else if (day < selectedStart) {
                                        setSelectedStart(day);
                                        setSelectedEnd(selectedStart);
                                    } else {
                                        setSelectedEnd(day);
                                    }
                                }}
                                className={cn(
                                    "p-1 m-auto flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                                    isStart || isEnd ? "bg-gray-900 text-white font-medium" :
                                        isSelectedRange ? "bg-gray-100 text-gray-900" :
                                            "hover:bg-gray-100 text-gray-700"
                                )}
                            >
                                {format(day, 'd')}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div
                className="fixed inset-0 bg-black/20 pointer-events-auto transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={overlayRef}
                className="pointer-events-auto relative bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200 w-full max-w-[900px] max-h-[90vh] overflow-y-auto"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex flex-col lg:flex-row lg:space-x-8 mb-6 w-full justify-between">
                    {renderMonth(viewDate, true, false, "block")}
                    {renderMonth(addMonths(viewDate, 1), false, false, "hidden md:block")}
                    {renderMonth(addMonths(viewDate, 2), false, true, "hidden lg:block")}
                </div>

                <div className="flex justify-between items-center w-full mt-6 border-t pt-4">
                    <div className="flex space-x-2 flex-wrap sm:flex-nowrap gap-2 sm:gap-0">
                        <div className="px-3 py-1.5 border rounded-md text-sm text-gray-700 bg-gray-50 flex items-center min-w-[120px] justify-center text-center">
                            {selectedStart ? format(selectedStart, 'MMM d, yyyy') : 'Start date'}
                        </div>
                        <span className="text-gray-400 hidden sm:flex items-center">—</span>
                        <div className="px-3 py-1.5 border rounded-md text-sm text-gray-700 bg-gray-50 flex items-center min-w-[120px] justify-center text-center">
                            {selectedEnd ? format(selectedEnd, 'MMM d, yyyy') : 'End date'}
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                // Default to start/end as current date if nothing selected to keep behavior robust
                                const start = selectedStart || new Date();
                                const end = selectedEnd || selectedStart || new Date();
                                onApply(start, end);
                                onClose();
                            }}
                            className={cn(
                                "px-4 py-2 text-sm font-medium text-white rounded-md",
                                (!selectedStart) ? "bg-gray-300 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800"
                            )}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
