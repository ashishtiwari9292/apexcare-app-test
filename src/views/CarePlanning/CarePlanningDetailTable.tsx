import { Card} from 'components';
import { formatName } from 'lib';
import { Box } from '@material-ui/core';
import { ClientsModalContent } from './Clients/ClientsModalContent';
import { CarePartnersModalContent } from './CarePartners';
import moment from 'moment';
import parse from 'html-react-parser'

interface CarePlanningTableProps {
  data: any;
  title: string;
  fetch:any;
}

export function CarePlanningDetailTable({ data, title,fetch }: CarePlanningTableProps) {
  const type = data.client ? 'client' : 'carePartner';

  const generateRows = (rowObj: any) => {
    let row: any = {
      id: rowObj[type]._id,
      name: {
        value: formatName(rowObj[type].firstName, rowObj[type].lastName),
        style: { width: '15%' },
      },
      firstName:rowObj[type].firstName,
      lastName:rowObj[type].lastName,
      location: { value: rowObj[type].location.location, style: { width: '8%' } },
      status: {
        value: rowObj[type].active ? 'Active' : 'Inactive',
        style: { width: '5%' },
      },
      state:{
        value:{
          comments:rowObj[type].comments
        }
      }
  
    };
    if (data.client) {
      row = {
        ...row,
        careManager: {
          value: formatName(rowObj[type]?.careManager?.firstName, rowObj[type]?.careManager?.lastName),
          style: { width: '10%' },
        },
       
      };
    }
    row = {
      ...row,
      comments: { value: parse(rowObj[type]?.comments|| ''), style: { width: rowObj[type].active ? '50%' : '15%' } },
      activeDate:moment(rowObj[type].activateDate),
  
    };
    if (!data[type].active) {
      row = {
        ...row,
        closingComments: rowObj[type]?.closingComments || '',
        deactivateBy: {
          value: rowObj[type]?.deactivateBy
            ? formatName(rowObj[type]?.deactivateBy.firstName, rowObj[type]?.deactivateBy.lastName)
            : '',
          style: { width: '10%' },
        },
        deactivateDate: { value: rowObj[type].deactivateDate, style: { width: '12%' } },
      };
    }
    return [row];
  };
  
  return (
    <>
      <Box sx={{ boxShadow: 0 }}>
      </Box>
      <Card>
        {type === 'client' ? <ClientsModalContent detail={true} selected={generateRows(data)[0]} closeHandler = {fetch}/> : <CarePartnersModalContent detail = {true} selected={generateRows(data)[0]} closeHandler = {fetch} />}
      </Card>
    </>
  );
}


