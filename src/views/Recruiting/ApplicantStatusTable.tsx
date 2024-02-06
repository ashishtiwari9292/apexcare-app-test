import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CardContent from '@mui/material/CardContent';
import { Card, CardHeader, Spinner, NoData, Table } from 'components';
import API from 'services/AxiosConfig';
import { useCompany } from 'hooks';
import { Link } from 'react-router-dom';
import { colorCode, colorCodeApplicant } from 'lib';

export const ApplicantStatusTable = ({ options }: any) => {
  const { locations } = useCompany()
  const [rows, setRows]: any[] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(0)
  const [sortVal, setSortVal] = useState({ sortVal: 'activeDate', ascending: true })

  const calculateDays = (date: any, fallBack?: any) => {
    if (!date) {
      if (!fallBack) return 'N/A'
      date = fallBack
    }
    let activeDate = new Date(date)
    let today = new Date()
    let differenceInTime = today.getTime() - activeDate.getTime()
    let differenceInDays = differenceInTime / (1000 * 3600 * 24)
    return Math.floor(parseInt(differenceInDays.toFixed(0)))
  }

  const handleSort = (sortVal: string, type: string, ascending: boolean) => {
    setSortVal({ sortVal: sortVal, ascending: ascending })
  };
  const generateRows = (data: any) =>
    data.map((rowObj: any) => ({
      location: rowObj.location,
      count: rowObj?.data[0]?.metaData[0]?.totalCount,
      data: rowObj.data[0].records.map((item: any) => ({
        location: { value: '', style: { width: '10%' } },
        name: { value: (<Link className='applicant-name-link' to={`/recruiting/applicants/${item._id}`}>{item.fullName}</Link>), style: { width: '20%', color: colorCodeApplicant(calculateDays(item?.activeDate)) } },
        activeDate: { value: new Date(item?.activeDate).toLocaleDateString(), style: { width: '10%', marginRight: '10px', color: colorCodeApplicant(calculateDays(item?.activeDate)) } },
        daysActive: { value: calculateDays(item?.activeDate), style: { width: '8%', color: colorCodeApplicant(calculateDays(item?.activeDate)) } },
        daysOfNoContact: { value: calculateDays(item?.activities?.date), style: { width: '10%', color: colorCodeApplicant(calculateDays(item?.activeDate)) } },
        daysOfNoActivity: { value: calculateDays(item?.lastStageDateUpdate), style: { width: '10%', color: colorCodeApplicant(calculateDays(item?.activeDate)) } },
        stage: { value: item?.stage?.stage, style: { width: '10%', color: colorCodeApplicant(calculateDays(item?.activeDate)) } },
        daysInStage: { value: item?.lastStageUpdate ? calculateDays(item?.lastStageUpdate) : 'N/A', style: { width: '10%', color: colorCodeApplicant(calculateDays(item?.activeDate)) } },
        state: { id: item?.id }
      })),
    }));

  const fetchData = () => {
    setLoading(true)
    API.get(`/applicants/status?locationId=${locations.map(item => item._id).join(',')}&page=${page}&limit=${limit}&sortVal=${sortVal.sortVal}&ascending=${sortVal.ascending}`)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setRows(data)
        setLoading(false)

      })
      .catch((error: any) => {
        toast.error('Failed to load Applicants.');
        setLoading(false)
        console.error(error);
      });
  }

  useEffect(() => {
    fetchData();
    setLoading(false)
  }, [page, limit, sortVal]);

  useEffect(() => {
    fetchData()
  }, [])


  return (
    <Card>
      <CardHeader
        expanded={expanded}
        setExpanded={setExpanded}
        expandable={true}
        type=""
        title="Applicant Status"
        setType={() => { }}
        addIcon={false}
      />
      {loading && <Spinner />}
      {!loading && (
        <CardContent>
          <Table
            columns={['', 'Applicant', 'Active Date', 'Days Active', 'Days No Activity', 'Days No Progress', 'Stage', 'Days in Stage']}
            rows={generateRows(rows)}
            type={"applicant-status"}
            hideArchive={true}
            currentPage={page}
            pageChangeHandler={(page) => setPage(page)}
            currentRow={limit}
            setCurrentRow={(limit: any) => setLimit(limit)}
            handleSort={handleSort}
          />
        </CardContent>
      )}
      {!loading && rows.length === 0 && <NoData />}
    </Card>
  );
};