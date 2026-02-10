import React, { useEffect, useState, useRef } from 'react';

interface DualRangeSliderProps {
    min: number;
    max: number;
    step: number;
    value?: [number, number];
    onChange: (values: [number, number]) => void;
    formatLabel?: (value: number) => string;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
    min,
    max,
    step,
    value,
    onChange,
    formatLabel = (val) => val.toString(),
}) => {
    const [minVal, setMinVal] = useState(value ? value[0] : min);
    const [maxVal, setMaxVal] = useState(value ? value[1] : max);
    const minValRef = useRef(value ? value[0] : min);
    const maxValRef = useRef(value ? value[1] : max);
    const range = useRef<HTMLDivElement>(null);

    // Sync with external value
    useEffect(() => {
        if (value) {
            setMinVal(value[0]);
            setMaxVal(value[1]);
            minValRef.current = value[0];
            maxValRef.current = value[1];
        }
    }, [value]);

    // Convert to percentage
    const getPercent = (value: number) => Math.round(((value - min) / (max - min)) * 100);

    // Set width of the range to decrease from the left side
    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);

        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, getPercent]);

    // Set width of the range to decrease from the right side
    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);

        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, getPercent]);

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="relative w-full h-6 flex items-center">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={minVal}
                    onChange={(event) => {
                        const value = Math.min(Number(event.target.value), maxVal - 1);
                        setMinVal(value);
                        minValRef.current = value;
                        onChange([value, maxVal]);
                    }}
                    className="thumb thumb--left z-[3] absolute h-0 w-full outline-none pointer-events-none appearance-none"
                    style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={maxVal}
                    onChange={(event) => {
                        const value = Math.max(Number(event.target.value), minVal + 1);
                        setMaxVal(value);
                        maxValRef.current = value;
                        onChange([minVal, value]);
                    }}
                    className="thumb thumb--right z-[4] absolute h-0 w-full outline-none pointer-events-none appearance-none"
                />

                <div className="slider-track relative w-full h-1.5 rounded bg-slate-200 dark:bg-slate-700">
                    <div ref={range} className="slider-range absolute h-1.5 rounded bg-primary z-[2]" />
                </div>
            </div>

            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>{formatLabel(minVal)}</span>
                <span>{formatLabel(maxVal)}</span>
            </div>

            <style>{`
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
          pointer-events: auto;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background-color: #0866ff; /* Primary color */
          box-shadow: 0 0 1px rgba(0,0,0,0.3);
          border: 2px solid white;
          cursor: pointer;
        }
        .thumb::-moz-range-thumb {
          -webkit-appearance: none;
          pointer-events: auto;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background-color: #0866ff;
          box-shadow: 0 0 1px rgba(0,0,0,0.3);
          border: 2px solid white;
          cursor: pointer;
        }
      `}</style>
        </div>
    );
};
