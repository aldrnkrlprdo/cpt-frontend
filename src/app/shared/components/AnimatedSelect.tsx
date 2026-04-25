import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface AnimatedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children?: React.ReactNode;
  options?: SelectOption[];
}

const AnimatedSelect: React.FC<AnimatedSelectProps> = ({ label, id, children, options, ...props }) => {
  const hasValue = props.value !== '' && props.value !== undefined;

  return (
    <div className="relative">
      <select
        id={id}
        {...props}
        className={`peer nbs-input ${props.className || ''} ${props.disabled && 'bg-gray-100'}`}
        disabled={props.disabled}
      >
        {options ? (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
      <label
        htmlFor={id}
        className={`
          absolute text-gray-500 duration-300 transform 
          -translate-y-4 top-2 z-10 origin-[0] 
          bg-white px-2 left-1
          ${!hasValue ? 'scale-100 translate-y-0' : 'scale-75'}
          peer-focus:scale-75 
          peer-focus:-translate-y-4
          peer-focus:text-blue-600
          peer-disabled:bg-gray-100
        `}
      >
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    </div>
  );
};

export default AnimatedSelect;