import { Select as MuiSelect, SelectChangeEvent, FormControl, Box, MenuItem } from '@mui/material';
import { ItemType } from 'typings';

interface SelectProps {
  value: string;
  defaultValue?: string;
  onChange: (e?: SelectChangeEvent) => void;
  name: string;
  items: ItemType[];
  label?: string;
  size?:any;
  styles?:any
}

export function Select({ value, defaultValue = '', onChange, name, items, label, size = 'small', styles = {}}: SelectProps): JSX.Element {
  return (
    <Box>
      {label && (
        <div
          className="bt"
        >
          {label}
        </div>
      )}
      <FormControl sx={{ minWidth: 150 }}>
        <MuiSelect
          MenuProps={{ disableScrollLock: true }}
          value={value}
          defaultValue={defaultValue}
          name={name}
          displayEmpty
          onChange={onChange}
          size={size}
          style ={styles ? styles : {}}
        >
          {items.map((item) => (
            <MenuItem key={item.key} value={item.key}>
              {item.label}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    </Box>
  );
}
