/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import type { InputHTMLAttributes } from 'react'
import { DatePickerInput } from '@mantine/dates'
import { Select, TextInput } from '@mantine/core'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string
  label?: string
  sizeMantine?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  type?: string
  hidden?: boolean
  placeholder?: string
  display?: 'block' | 'none'
  inputsProps?: any
  formatter?: (value: string | number) => string | number
  options?: Array<{ value: string; label: string }>
  error?: React.ReactNode
  leftSection?: React.ReactNode
  rightSection?: React.ReactNode
  component?: 'textInput' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'switch' | 'datePicker'
}

export default function Input({ name, label, component, ...rest }: InputProps) {
  if (rest.inputsProps?.onChange) {
    const originalOnChange = rest.inputsProps.onChange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rest.inputsProps.onChange = (e: any) => {
      if (rest.formatter) {
        e.target.value = rest.formatter(e.target.value)
      }
      originalOnChange(e)
    }
  }

  const props: Record<string, unknown> = {
    name,
    label,
    type: rest.type,
    hidden: rest.hidden,
    placeholder: rest.placeholder,
    size: rest.sizeMantine,
    display: !rest.hidden ? 'block' : 'none',
    value: rest?.value,
    leftSection: rest.leftSection,
    rightSection: rest.rightSection,
    ...rest.inputsProps,
    defaultValue: rest.defaultValue,
  }

  let input = null
  if (component === 'select') {
    input = (
      <Select
        data={rest.options}
        hidden={rest.hidden}
        label={label}
        placeholder={rest.placeholder}
      />
    )
  }
  if (component === 'datePicker') {
    input = (
      <DatePickerInput
        clearable
        locale="es-mx"
        {...props}
        {...rest.inputsProps}
        error={rest.error}
      />
    )
  }
  const className = rest.hidden || rest.className ? rest.className : 'cd-pb-4'
  return <div className={className}>{input || <TextInput {...props} />}</div>
}
