import React from 'react';
import {
  CardHeader as MuiCardHeader,
  Fab,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

interface CardHeaderProps {
  title?: string;
  setOpenModal?: (open: boolean) => void;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  expandable?: boolean;
  radioGroup?: boolean;
  setType?: (type: any) => void;
  radioGroupLabel1?: string,
  radioGroupLabel2?: string,
  type?: any;
  addIcon?: any;
  renderAll?:boolean
}

export function CardHeader({
  title,
  setOpenModal = () => { },
  expanded,
  setExpanded,
  expandable = true,
  radioGroup = false,
  radioGroupLabel1 = 'Client',
  radioGroupLabel2 = 'Care Partner',
  type = '',
  setType = () => { },
  addIcon = true,
  renderAll = true
}: CardHeaderProps): JSX.Element {
  return (
    <MuiCardHeader
      className="fs-24"
      action={
        <Stack direction="row" spacing={1} alignItems="center">
          {radioGroup && (
            <FormControl>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                row
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <FormControlLabel value={radioGroupLabel1} control={<Radio />} label={radioGroupLabel1} />
                <FormControlLabel value={radioGroupLabel2} control={<Radio />} label={radioGroupLabel2} />
                {renderAll && <FormControlLabel defaultChecked={true} value="All" control={<Radio />} label="All" />}
              </RadioGroup>
            </FormControl>
          )}
          {!!addIcon && (
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              <AddIcon />
            </Fab>
          )}
          {expandable && (
            <ExpandMore
              expand={expanded}
              onClick={() => {
                setExpanded(!expanded);
              }}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          )}
        </Stack>
      }
      title={title ? <div className="title"> {title}</div> : ''}
    />
  );
}
