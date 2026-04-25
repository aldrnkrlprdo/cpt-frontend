import React from 'react';

interface AnimatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const AnimatedTextarea: React.FC<AnimatedTextareaProps> = ({ label, id, ...props }) => {
  return (
    <div className="relative">
      <textarea
        id={id}
        {...props}
        // The space in placeholder is crucial for the animation to work correctly
        placeholder=" "
        className={`peer nbs-input ${props.className || ''}`}
      />
      <label
        htmlFor={id}
        className="
          absolute text-gray-500 duration-300 transform 
          -translate-y-4 scale-75 top-2 z-10 origin-[0] 
          bg-white px-2 left-1
          peer-placeholder-shown:scale-100 
          peer-placeholder-shown:translate-y-0 
          peer-focus:scale-75 
          peer-focus:-translate-y-4
          peer-focus:text-blue-600
          peer-disabled:bg-gray-100
        "
      >
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    </div>
  );
};

export default AnimatedTextarea;