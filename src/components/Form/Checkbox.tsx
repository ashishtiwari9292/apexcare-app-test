import React from 'react';
import { FormControl, FormGroup, Checkbox as MuiCheckbox } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';

interface CheckboxProps {
  checked?: boolean;
  onChange: (event: any) => void;
  name?: string;
  label?: string;
}

export function Checkbox({ checked = false, onChange, name = 'flag', label = 'Flag' }: CheckboxProps): JSX.Element {
  return (
    <FormControl
      sx={{
        width: '100%',
        margin: '10px 0px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
      }}
    >
      <FormGroup>
        <FormControlLabel control={<MuiCheckbox name={name} checked={checked} onChange={onChange} />} label={label} />
      </FormGroup>
    </FormControl>
  );
}
