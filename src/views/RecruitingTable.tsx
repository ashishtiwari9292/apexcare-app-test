import { useState, useEffect } from 'react';
import { Card, CardHeader, Modal, Spinner, NoData, Table } from 'components';
import { Link, useParams } from 'react-router-dom';
import API from 'services/AxiosConfig';
import { CardContent } from '@mui/material';

export const RecruitingTable = ({ title, filter }: any) => {
  const [rows, setRows] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [progressData, setProgressData] = useState<any>([]);
  const [columns, setColumns] = useState<any>([])
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(0)
  const userId = useParams();

  const generateRows = (data: any) => {
    const conditionalData = filter.location.value === 'All' ? data : data.filter((obj: any) => obj.location === filter.location.value)
    return conditionalData.map((rowObj: any) => ({
      location: rowObj.location,
      count: rowObj?.data[0]?.metaData[0]?.totalCount,
      data: rowObj.data[0].records.map((item: any) => {
        let currentApplicant: any = {
          fullName: { value: (<Link className='applicant-name-link' to={`/recruiting/applicants/${item?.applicant?._id}`}>{item?.applicant?.fullName}</Link>), style: { width: '15%' } },
          state: { id: 123, stage: item }
        }
        item.progress.forEach((progressItem: any) => {
          progressItem.cardItems.forEach((obj: any, idx: number) => {
            currentApplicant[obj.label] = { value: obj?.value?.slice(5, 10), style: { width: '7vw', padding: '10px', borderRight: idx === progressItem.cardItems.length - 1 ? '1px solid grey' : '1px solid lightgray', borderLeft: idx === 0 ? '1px solid grey' : '1px solid lightgray', textAlign: 'center', }, state: { stage: obj.label, type: 'recruiting' } }
          })
        })
        return currentApplicant

      }),
    }))
  };


  const fetchData = (filter: any, limit: any, page: any) => {
    setLoading(true)
    const url = `/applicants/all?active=${filter.status.value}&stage=${filter.stage.value}&location=${filter.location.id}&flag=${filter.flag}&page=${page}&limit=${limit}`
    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setRows(generateRows(data))
        const arr: any = [{ val: 'Full Name' }]
        setProgressData(data.progress);
        API.get('applicants/progress')
          .then(({ data }) => {
            for (var i = 0; i < data.data.progress.length; i++) {
              arr.push({ val: data.data.progress[i].cardName.stage, span: data.data.progress[i].cardItems.length })
            }
            setColumns(arr)
            setLoading(false)
          })
      })
      .catch((error: any) => {
        setLoading(false)
        console.error(error);
      });
  };

  useEffect(() => {
    fetchData(filter, limit, page);
    setLoading(false)
    console.log('good stuff!',limit,page)
  }, [page, limit])


  useEffect(() => {
    fetchData(filter, limit, page);
  }, [filter]);

  return (
    <div>
      {loading && <Spinner />}
      {!loading && rows.length === 0 && <NoData />}
      {!loading && rows.length > 0 && (
        <CardContent style={{ width: '95%', marginLeft: '1.5%' }}>
          <Table
            columns={columns}
            rows={rows}
            handleEdit={() => { }}
            type={"applicants"}
            handleSort={() => { }}
            hideArchive={true}
            tableName={'recruiting'}
            currentPage={page}
            pageChangeHandler={(page) => setPage(page)}
            currentRow={limit}
            setRowsPer={(limit: any) => setLimit(limit)}
          />
        </CardContent>
      )}
    </div>
  )
};


