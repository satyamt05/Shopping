import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  id,
  name,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  size = 'md',
  variant = 'default',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseClasses = 'block w-full border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
  
  const variants = {
    default: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  const disabledClasses = disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white';

  const inputClasses = `${baseClasses} ${variants[error ? 'error' : variant]} ${sizes[size]} ${disabledClasses} ${className}`;

  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className={`block text-sm font-medium mb-1 ${error ? 'text-red-600' : 'text-gray-700'}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-${size === 'sm' ? '4' : size === 'lg' ? '6' : '5'} w-${size === 'sm' ? '4' : size === 'lg' ? '6' : '5'} text-gray-400`} />
          </div>
        )}
        
        <input
          type={type}
          id={inputId}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={`${inputClasses} ${Icon && iconPosition === 'left' ? 'pl-10' : ''} ${Icon && iconPosition === 'right' ? 'pr-10' : ''}`}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon className={`h-${size === 'sm' ? '4' : size === 'lg' ? '6' : '5'} w-${size === 'sm' ? '4' : size === 'lg' ? '6' : '5'} text-gray-400`} />
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
