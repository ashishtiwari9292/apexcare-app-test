// @ts-nocheck
import React, { useState, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import {
  SelectChangeEvent,
  Box,
  Checkbox,
  Container,
  FormControlLabel,
  Button,
  Autocomplete,
  TextField,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createTheme } from '@material-ui/core';
import { ThemeProvider } from '@emotion/react';
import { Select } from 'components';
import debounce from 'lodash/debounce';

const theme = createTheme({});

const useStyles = makeStyles({
  input: {
    height: 40,
  },
});

export const InputGroup = ({ label, setFilter, filter, inputs, styles, maxWidth = 'xl' }: any): JSX.Element => {
  const classes = useStyles();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [inputValue2, setInputValue2] = useState<string>('');
  const [tempFilter, setFormData] = useState({
    ...filter,
  });
  


  useEffect(() => {
    setFormData(filter);
  }, [filter]);

  const handleSelectChange = (event: SelectChangeEvent, items: any[], inputIdentifier: string) => {
    const tempFormData: any = {
      ...tempFilter,
    };
    const updatedFormElement = {
      ...tempFormData[inputIdentifier],
    };

    if (inputIdentifier === 'status' && event.target.value === 'Closed' && !tempFormData?.activity) {
      tempFormData.dateRange = { id: '7', label: 'Last 7 Days' };
    }
    updatedFormElement.id = event.target.value as string;
    updatedFormElement.value = items.find((item) => item.key === updatedFormElement.id).label;
    tempFormData[inputIdentifier] = updatedFormElement;
    setFormData(tempFormData);
  };


  
  useEffect(() => {
    if (!tempFilter.startDate || !tempFilter.endDate) {
      return;
    }
    const tempFormData: any = {
      ...tempFilter,
    };
    const updatedFormElement = {
      ...tempFormData.startDate,
    };
    const updatedFormElement2 = {
      ...tempFormData.endDate,
    };
    updatedFormElement.value = startDate;
    updatedFormElement2.value = endDate;
    tempFormData.startDate = updatedFormElement;
    tempFormData.endDate = updatedFormElement2;
    setFormData(tempFormData);

  }, [startDate, endDate]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, inputIdentifier: string) => {
    const tempFormData: any = {
      ...tempFilter,
    };
    const updatedFormElement = {
      ...tempFormData[inputIdentifier],
    };
    const { value } = event.target;
    updatedFormElement.id = value;
    updatedFormElement.value = value;
    tempFormData[inputIdentifier] = updatedFormElement;
    setFormData(tempFormData);
    if(inputIdentifier === 'companyName')  {
      setInputValue2(value)
    }else{
      setInputValue(value);
    }
   
  };

  const renderInputs = (input: any, index: number, style?:any) => {
    if (!input) return <></>;
    const { type } = input;
    if (type === 'button') {
      return (
        <Box sx={{ mb: 0.3, display: 'flex', alignItems: 'flex-end' }} key={index}>
          <Button
            variant="contained"
            onClick={(e) => {
              setFilter({
                ...filter,
                ...tempFilter,
              });
            }}
          >
            {input.label}
          </Button>
        </Box>
      );
    }
    if (type === 'select') {
      return (
        <Select
          key={index}
          value={tempFilter[input.name]?.id}
          onChange={(e: any) => {
            handleSelectChange(e, input.items, input.name);
          }}
          styles = {input.styles}
          name={input.name}
          items={input.items}
          label={input.label}
        />
      );
    }
    if (type === 'autoComplete') {
      return (
        <Box key={index}>
          <FormControl sx={{ ...input.styles }}>
            <div
              className="bt"
            >
              {input.label}
            </div>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={[{label:'',item:''},...input.options.map((option:any) => ({label:option.label,item:option.id}))]}
              renderOption={(props: any, option: any, { selected }) => <li {...props} key={option._id}>{option.label}</li> }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              size="small"
              onChange={debounce((event: any, newValue: any,reason) => {
                const tempFormData: any = {
                  ...tempFilter,
                };
                const updatedFormElement: any = {
                  ...tempFormData[input.name],
                };
                if(newValue == null){
                updatedFormElement.id = '';
                updatedFormElement.value = '';
                tempFormData[input.name] = updatedFormElement;
                setFormData(tempFormData);
                setFilter({
                  ...filter,
                  ...tempFormData,
                });
                return
                }
                updatedFormElement.id = newValue.item || '';
                updatedFormElement.value = newValue.label || '';
                tempFormData[input.name] = updatedFormElement;
                setFormData(tempFormData);
                setFilter({
                  ...filter,
                  ...tempFormData,
                });
              },300)}
              value={tempFilter[input.name]?.value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  type="text"
                  id="my-input"
                  aria-describedby="my-helper-text"
                  name={input.name}
                  value={tempFilter[input.name]?.id}
                />
              )}
            />
          </FormControl>
        </Box>
      );
    }
    if (type === 'checkbox') {
      return (
        <Box sx={{ }} key={index}>
          <FormControlLabel
            value={tempFilter[input.name]}
            control={<Checkbox />}
            label={input.label}
            name={input.name}
            labelPlacement="top"
            onChange={(e) => {
              const target = e.target as HTMLInputElement;
              setFormData({
                ...tempFilter,
                [input.name]: target.checked,
              });
            }}
          />
        </Box>
      );
    }
    if (type === 'customMonthField' && tempFilter?.numberOfDays?.value === 'Custom') {
      return (<>
        <FormControl sx={{ ...input.styles }}>
          <Box>{'Number of Months'}</Box>
          <TextField
            id='numberOfMonths'
            type="text"
            aria-describedby="my-helper-text"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleInputChange(e, 'numberOfMonths');
            }}
            style={{ height: '40px' }}
            InputProps={{ className: classes.input }}
          />
        </FormControl>
      </>)
    }
    if (type === 'customDateRange' && tempFilter.dateRange.value === 'Custom') {
      return (
        <Box key={index} sx={{ display: 'flex', width: '400px', gap: '12px', alignItems: 'flex-end' }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ width: '50%' }}>
              <ThemeProvider theme={theme}>
                <DatePicker
                  label="Start Date"
                  value={tempFilter.startDate.value || startDate}
                  maxDate={endDate || null}
                  onChange={(newValue: any) => {
                    setStartDate(newValue);
                  }}
                  renderInput={(params: any) => <TextField size="small" {...params} />}
                />
              </ThemeProvider>
            </Box>
            <div className = 'custom-date-range-label'>
              <p>to</p>
            </div>
            <Box sx={{ width: '50%' }}>
              <DatePicker
                label="End Date"
                value={tempFilter.endDate.value || endDate}
                onChange={(newValue: any) => {
                  setEndDate(newValue);
                }}
                minDate={startDate || null}
                renderInput={(params: any) => <TextField size="small" {...params} />}
              />
            </Box>
          </LocalizationProvider>
        </Box>
      );
    }
    if (type === 'textField') {
   
      return (
        <>
          <FormControl sx={{ ...input.styles }}>
            <Box>{input.label}</Box>
            <TextField
              id={input.name}
              type="text"
              aria-describedby="my-helper-text"
              label=""
              value={input?.name === 'companyName' ? inputValue2 : inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleInputChange(e, input.name);
              }}
              style={{ height: '40px' }}
              InputProps={{ className: classes.input }}
            />
          </FormControl>
        </>
      );
    }
  };
  let s = label === '' ? {}: { mt: 4, pt: 10 }
  return (
    <section>
      <Container maxWidth={maxWidth} sx={s}>
        <Box sx={{ my: label ? 4 : 8 }}>{label && <h2 className="pt">{label}</h2>}</Box>
        <Box sx={{ boxShadow: 4, p: 2, display: 'flex', flexGrow: 1 ,width: maxWidth===false ? '93%' : 'auto', marginLeft: !maxWidth ? '45px' : '0px' }}>
          <form style={{ ...styles }}>
            {inputs.map((input: any, i: number) => {
              return renderInputs(input, i);
            })}
          </form>
        </Box>
      </Container>
    </section>
  );
};
