import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import CardContent from '@mui/material/CardContent';
import { Card, Spinner, NoData, Table, Modal } from 'components';
import API from 'services/AxiosConfig';
import { GrFlagFill } from 'react-icons/gr';
import { abbreviationMap } from './statesList';
import CompaniesModalContent from './CompaniesModalContent';

export const CompaniesTable = ({ options, filter,addOpenModal, setAddOpenModal }: any) => {
  const [rows, setRows]: any[] = useState([]);
  const [loading, setLoading] = useState(false);
  const map:any = abbreviationMap

  const generateRows = (data: any) =>
    data.map((rowObj: any) => ({
        flag: {
            value: rowObj.flag ? <GrFlagFill color="red" /> : <></>,
            style: { width: '5%' },
            selected: rowObj.flagged === true,
          },
          status:{value:rowObj.status ? 'Active': 'Inactive', style: { width: '5%' }},
          location: { value: rowObj?.location?.location || "", style: { width: '5%' } },
        companyName:{value:rowObj?.companyName || "",style: { width: '15%' }},
        companyType:{value:rowObj?.companyType?.companyType || "", style:{width:'15%'}},
        phone: { value: rowObj?.phoneNumber || "", style: { width: '12%' } },
        comments: { value: rowObj?.comments || "", style: { width: '50%', whitespace:'pre-wrap'} },
        lastActivity: { value: null, style: { width: '5%' } },
        state:{id:rowObj?._id}
    }));

    const fetchData = useCallback((filter) => {
        setLoading(true)
        API.get(`referral-partners/companies/listing?status=${filter?.status?.value}&location=${filter?.location?.value}&companyName=${filter?.companyName?.value}&flag=${filter?.flag}&companyType=${filter?.companyType?.id}`)
          .then((rsp: any) => {
            const data = rsp.data.data;
            setRows(generateRows(data))
            setLoading(false)
          })
          .catch((error: any) => {
            toast.error('Failed to  get Companies.');
            console.error(error);
            setLoading(false)
          });
      }, []);

      
const handleClose = ()=>{
  fetchData(filter)
  setAddOpenModal(false)
}

  useEffect(() => {
    fetchData(filter)
  }, [filter])


  return (
    <div>
         <Modal open={addOpenModal} closeHandler={handleClose} >
            <CompaniesModalContent closeMe={handleClose} />
          </Modal>
      {loading && <Spinner />}
      {(!loading && rows.length > 0) && (
        <>
          <Table
            columns={['Flag','Status','Location','Company','Company Type', 'Phone',  'Comments', '','' ]}
            rows={rows}
            type={"companies"}
            hideArchive={true}
            rowsPer={25}
          />
          </>
      )}
      {(!loading && rows.length === 0 )&& <NoData />}
    </div>
  );
};

