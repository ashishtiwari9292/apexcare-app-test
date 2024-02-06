import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Card, Spinner, NoData, Table, CardHeader } from 'components';
import API from 'services/AxiosConfig';
import { GrFlagFill } from 'react-icons/gr';

export const ReferralPartnersTasksTable = ({ options, filter }: any) => {
  const [rows, setRows]: any[] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true)

  const generateRows = (data: any) =>
    data.map((rowObj: any) => ({
      flag: {
        value: rowObj.flag ? <GrFlagFill color="red" /> : <></>,
        style: { width: '5%' },
        selected: rowObj.flagged === true,
      },
      status: { value: rowObj.status ? 'Active' : 'Inactive', style: { width: '5%' } },
      companyName: { value: rowObj?.companyName?.companyName, style: { width: '20%' } },
      firstName: { value: rowObj.firstName, style: { width: '10%' } },
      lastName: { value: rowObj.lastName, style: { width: '10%' } },
      title: { value: rowObj.title, style: { width: '15%' } },
      location: { value: rowObj.location.location, style: { width: '10%' } },
      phone: { value: rowObj.primaryPhone, style: { width: '10%' } },
      comments: { value: rowObj.comments, style: { width: '30%', whitespace: 'pre-wrap' } },
      lastActivity: { value: null, style: { width: '5%' } },
      state: { id: rowObj?._id, companName: rowObj.companyName }
    }));

  const fetchData = useCallback((filter) => {
    setLoading(true)
    API.get(`referral-partners?status=${filter?.status?.value}&location=${filter?.location?.value}&companyName=${filter?.companyName?.value}&referralPartner=${filter?.referralPartner?.value}&flag=${filter?.flag}`)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setRows(generateRows(data))
        setLoading(false)
      })
      .catch((error: any) => {
        toast.error('Failed to Referral Partners.');
        console.error(error);
        setLoading(false)
      });
  }, []);


  useEffect(() => {
    fetchData(filter)
  }, [filter])


  return (
    <Card style ={{}}>
       <CardHeader
        title="Referral Partner Tasks"
        expanded={expanded}
        setExpanded={setExpanded}
        expandable={false}
        type={''}
        setType={() => { }}
        setOpenModal={()=>{}}
      />
      {loading && <Spinner />}
      {!loading && rows.length === 0 && <NoData />}
      {!loading &&  rows.length !== 0 && (
        <>
        <Table
          columns={['Date', 'Time', 'Completed By', 'Comments', '', '']}
          rows={rows}
          type={"referral-partners"}
          hideArchive={true}
        />
        </>
      )}
    </Card>
  );
};