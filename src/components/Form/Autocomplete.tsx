import { Autocomplete as MUIAutoComplete, TextField } from '@mui/material';
import { formatName } from 'lib';
import React, { useEffect, useState } from 'react'

export default function Autocomplete({ value, options, onChange, label, width, marginTop, getOptionsLabel, renderOptions = false, error = false, helperText = null, disabled = false }: any) {

  const [inputValue, setInputValue] = useState(`${value?.firstName} ${value?.lastName}`)

  useEffect(() => {
    const name = formatName(value?.firstName || '', value?.lastName)
    setInputValue(name)
  }, [value])

  return (
    <MUIAutoComplete
      sx={{ marginTop: marginTop || '10px', width: width || 'auto' }}
      disablePortal
      id="combo-box-demo"
      value={value}
      inputValue={inputValue}
      options={options}
      onChange={onChange}
      getOptionLabel={getOptionsLabel ? (option: any) => option.label : (option: any) => `${option.firstName} ${option.lastName}`}
      renderOption={renderOptions ? (props: any, option: any, { selected }) => <li {...props} key={option._id}>{option.label}</li> : (props: any, option: any, { selected }) => <div {...props} key={option._id}>{`${option.firstName} ${option.lastName}`}</div>}
      renderInput={(params) => <TextField error={error} helperText={helperText} value={inputValue} {...params} label={label} onChange={(e) => setInputValue(e.target.value)} />}
      isOptionEqualToValue={(option: any, value: any) => {
        return true
      }}
      disabled={disabled}

    />
  )
}