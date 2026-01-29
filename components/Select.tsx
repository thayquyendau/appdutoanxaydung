
import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';

export interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps {
    label?: string;
    value: string | number;
    onChange: (value: any) => void;
    options: SelectOption[];
    disabled?: boolean;
    className?: string;
}

export default function Select({
    label,
    value,
    onChange,
    options,
    disabled,
    className
}: SelectProps) {
    const selectedOption = options.find((opt) => opt.value === value) || options[0];

    return (
        <div className={clsx("w-full", className)}>
            {label && (
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {label}
                </label>
            )}
            <Listbox value={value} onChange={onChange} disabled={disabled}>
                <div className="relative mt-1">
                    <Listbox.Button className={clsx(
                        "relative w-full cursor-default rounded-xl bg-white dark:bg-slate-800 py-3 pl-4 pr-10 text-left border border-slate-200 dark:border-slate-700 shadow-sm focus:outline-none focus:border-[#0a59ac] focus:ring-1 focus:ring-[#0a59ac] sm:text-sm transition-all",
                        disabled ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900" : "cursor-pointer hover:border-slate-300 dark:hover:border-slate-600"
                    )}>
                        <span className="block truncate font-bold text-slate-700 dark:text-slate-200">
                            {selectedOption ? selectedOption.label : 'Select option'}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-slate-400"
                                aria-hidden="true"
                            />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {options.map((option, personIdx) => (
                                <Listbox.Option
                                    key={personIdx}
                                    className={({ active }) =>
                                        clsx(
                                            "relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors",
                                            active ? "bg-[#0a59ac]/5 text-[#0a59ac]" : "text-slate-900 dark:text-slate-100"
                                        )
                                    }
                                    value={option.value}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={clsx(
                                                    "block truncate",
                                                    selected ? "font-black" : "font-medium"
                                                )}
                                            >
                                                {option.label}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#0a59ac]">
                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}
