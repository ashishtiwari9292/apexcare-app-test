import React, { useState } from 'react';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import { Card, CardHeader, Table } from 'components';
import { formatName } from 'lib';
import { Box } from '@mui/material';
import { ClientsModalContent } from './ClientsModalContent';
interface CarePlanningTableProps {
  client: any;
}

export function ClientDetailTable({ client }: CarePlanningTableProps) {
  const [expanded, setExpanded] = useState<boolean>(true);

  const generateRows = (rowObj: any) => [
    {
      id: rowObj._id,
      name: {
        value: formatName(rowObj.firstName, rowObj.lastName),
        style: { width: '15%' },
      },
      location: { value: rowObj.location.location, style: { width: '10%' } },
      status: {
        value: rowObj.active ? 'Active' : 'Inactive',
        style: { width: '10%' },
      },
      careManager: {
        value: formatName(rowObj.careManager.firstName, rowObj.careManager.lastName),
        style: { width: '15%' },
      },
      comments: { value: rowObj.comments, style: { width: '50%' } },
    },
  ];

  // return (
  //   <Card>
  //     <CardHeader title="Client Details" addIcon={false} expanded={expanded} setExpanded={setExpanded} />
  //     <Collapse in={expanded} timeout="auto" unmountOnExit>
  //       <CardContent>
  //         <Table
  //           columns={['Name', 'Location', 'Status', 'Care Manager', 'Comments', 'Closing Comments']}
  //           rows={generateRows(client)}
  //           type="detail"
  //         />
  //       </CardContent>
  //     </Collapse>
  //   </Card>
  // );
  return (
    <>
      <Box sx={{ boxShadow: 0, pt:18 }}>
      </Box>
       <Card>
      <ClientsModalContent selected = {generateRows(client)}/>
      </Card>
    </>
  );
}
