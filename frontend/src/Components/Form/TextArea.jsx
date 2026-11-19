import React from 'react'
import './Form.css'

/*
  Campo de formulario reutilizable (label + textarea).

  Uso:
    <TextArea
      name="description"
      label="Descripcion:"
      value={formState.description}
      onChange={handleChangeInput}
      maxLength={1000}
    />
*/
function TextArea({
  name,
  label,
  value,
  onChange,
  maxLength,
  ...props
}) {
  return (
    <div className='form-field'>
      <label className='form-field__label' htmlFor={name}>
        {label}
      </label>
      <textarea
        className='form-field__input form-field__textarea'
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        {...props}
      />
      {
        maxLength
        &&
        <span className='form-field__counter'>
          {value.length}/{maxLength} caracteres
        </span>
      }
    </div>
  )
}

export default TextArea
