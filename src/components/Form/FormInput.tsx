// @ts-nocheck

import { FormControl, TextField, Autocomplete } from '@mui/material';
import { DatePicker, LocalizationProvider ,TimePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns-tz';
import { useEffect } from 'react';

interface FormInputProps {
  name: string;
  label: string;
  value: any;
  onChange: (e: any) => void;
  error: boolean | undefined;
  helperText: any;
  type?: string;
  width?: string;
  required?: boolean;
  textarea?: boolean;
  labelProps?: any;
  disabled?: boolean;
}

interface FormInputAutocompleteProps extends FormInputProps {
  autocompleteOnChange: (e: any, value: string | null) => void;
  autocompleteValue: any;
  options: any;
  getOptions?:any;
  margin?:string;
}

interface FormPickerProps extends FormInputProps {
  pickerOnChange: (value: string | null) => void;
}

export function FormInput({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  type = 'text',
  width,
  required = false,
  textarea,
  labelProps = {},
  disabled = false,
}: FormInputProps): JSX.Element {
  return (
    <FormControl sx={{ width: width ? width : '100%', margin: '10px 0px' }}>
      <TextField
        InputLabelProps={{ ...labelProps, shrink: true }}
        id={name}
        type={type}
        aria-describedby="my-helper-text"
        label={label + (required ? ' *' : '')}
        value={value}
        onChange={onChange}
        error={error}
        helperText={helperText}
        minRows={textarea ? 5 : 1}
        maxRows={textarea ? 5 : 1}
        multiline={!!textarea}
        disabled={disabled}
      />
    </FormControl>
  );
}

export function CompanyAutocomplete({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  type = 'text',
  width,
  autocompleteOnChange,
  autocompleteValue,
  options,
  required,
  disabled = false,
  margin = '10px 0px',
  getOptions = (option: any) => option,
}: FormInputAutocompleteProps): JSX.Element {
  return (
    <FormControl sx={{ width: width ? width : '100%', margin: margin }}>
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={options}
        getOptionLabel={getOptions}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option._id}>
            {`${option?.companyName}`}
          </li>
        )}
        filterOptions={(options, { inputValue }) =>
          options.filter(option =>{
            const label = option?.companyName?.trim().toLowerCase();
            if(!inputValue){
              return true
            }
            return label.includes(inputValue.trim().toLowerCase())
          })
        }
        value={autocompleteValue || value || null}
        defaultValue={autocompleteValue || value || null}
        isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
        onChange={autocompleteOnChange}
        renderInput={(params) => (
          <TextField
            {...params}
            type={type}
            id="my-input"
            aria-describedby="my-helper-text"
            name={name}
            label={label + (required ? ' *' : '')}
            value={value}
            onChange={onChange}
            error={error}
            helperText={helperText}
            disabled={disabled}
          />
        )}
      />
    </FormControl>
  );
}
export function PersonAutocomplete({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  type = 'text',
  width,
  autocompleteOnChange,
  autocompleteValue,
  options,
  required,
  disabled = false,
  margin = '10px 0px',
  getOptions = (option: any) => option,
}: FormInputAutocompleteProps): JSX.Element {
  return (
    <FormControl sx={{ width: width ? width : '100%', margin: margin }}>
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={options}
        getOptionLabel={getOptions}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option._id}>
            {`${option.firstName || ''} ${option.lastName || ''}`}
          </li>
        )}
        filterOptions={(options, { inputValue }) =>
          options.filter(option =>{
            const label = `${option?.firstName?.toLowerCase() || ''} ${option?.lastName?.toLowerCase() || ''}`.trim();
            if(!inputValue){
              return true
            }
            return label.includes(inputValue.trim().toLowerCase())
          })
        }
        value={autocompleteValue || value || null}
        defaultValue={autocompleteValue || value || null}
        isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
        onChange={autocompleteOnChange}
        renderInput={(params) => (
          <TextField
            {...params}
            type={type}
            id="my-input"
            aria-describedby="my-helper-text"
            name={name}
            label={label + (required ? ' *' : '')}
            value={value}
            onChange={onChange}
            error={error}
            helperText={helperText}
            InputLabelProps={{ shrink: true }}
            disabled={disabled}
          />
        )}
      />
    </FormControl>
  );
}
export function FormAutocomplete({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  type = 'text',
  width,
  autocompleteOnChange,
  autocompleteValue,
  options,
  required,
  disabled = false,
  margin = '10px 0px' ,
  getOptions = (option:any) => option
}: FormInputAutocompleteProps): JSX.Element {
  return (
    <FormControl sx={{ width: width ? width : '100%', margin: margin  }}>
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={options}
        getOptionLabel = {getOptions}
        value = {autocompleteValue|| value || null}
        defaultValue={autocompleteValue || value || null}
        isOptionEqualToValue={(option:any, value:any) => option?.id === value?.id}
        onChange={autocompleteOnChange}
        renderInput={(params) => (
          <TextField
            {...params}
            type={type}
            id="my-input"
            aria-describedby="my-helper-text"
            name={name}
            label={label + (required ? ' *' : '')}
            value={value}
            onChange={onChange}
            error={error}
            helperText={helperText}
            InputLabelProps={{ shrink: true }}
          />
        )}
        disabled={disabled}
      />
    </FormControl>
  );
}

export function FormTextArea({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  type = 'text',
  width,
  required = false,
  disabled = false,
}: FormInputProps): JSX.Element {
  return (
    <FormControl sx={{ width: width ? width : '100%', margin: '10px 0px' }}>
      <TextField
        id={name}
        type={type}
        aria-describedby="my-helper-text"
        label={label + required ? ' *' : ''}
        value={value}
        onChange={onChange}
        error={error}
        helperText={helperText}
        InputLabelProps={{ shrink: true }}
        disabled={disabled}
      />
    </FormControl>
  );
}

export function FormDatePicker({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  type = 'text',
  width,
  disabled,
  pickerOnChange,
  required,
}: FormPickerProps): JSX.Element {
  return (
    <FormControl sx={{ width: width ? width : '100%' }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label={label}
          value={value}
          onChange={pickerOnChange}
          disabled = {disabled || false}
          renderInput={(params:any) => (
            <TextField
              {...params}
              type={type}
              id="my-input"
              aria-describedby="my-helper-text"
              name={name}
              label={label + (required ? ' *' : '')}
              value={value}
              error={error}
              helperText={helperText}
              InputLabelProps={{ shrink: true }}
            
            />
          )}
        />
      </LocalizationProvider>
    </FormControl>
  );
}

export function FormTimePicker({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  type = 'text',
  width,
  pickerOnChange,
  required,
}: FormPickerProps): JSX.Element {




  return (
    <FormControl sx={{ width: width ? width : '100%' }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <TimePicker
          label={label}
          value={value}
          onChange={pickerOnChange}
          renderInput={(params:any) => (
            <TextField
              {...params}
              type={type}
              id="my-input"
              aria-describedby="my-helper-text"
              name={name}
              label={label + (required ? ' *' : '')}
              value={value.toString()}
              onChange={onChange}
              error={error}
              helperText={helperText}
              InputLabelProps={{ shrink: true }}
            />
          )}
        />
      </LocalizationProvider>
    </FormControl>
  );
}
