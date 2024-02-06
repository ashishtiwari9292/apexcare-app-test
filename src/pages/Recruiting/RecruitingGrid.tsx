import { useEffect, useState } from 'react';
import {
  FilterHeader,

} from 'views';
import { Layout } from 'components';

import API from 'services/AxiosConfig';
import { RecruitingTable } from 'views/RecruitingTable';

export const RecruitingGrid = (): JSX.Element => {

  const [filter, setFilter] = useState({ 
  flag:"false",
  location: { id: '0', value: 'All' },
  status: { id: 'Active', value: 'Active' },
  stage: { id: '', value: 'All' },
  dateRange: { id: 'All', value: 'All' },
  startDate: { id: '', value: '' },
  endDate: { id: '', value: '' },});
  const [options,setOptions] = useState([])
  const fetchOptions = async () => {
    let opts = await API.get('/applicants/stages')
    setOptions(opts.data.data.filter((item:any) => item.status === (filter.status.value === 'Active')))
  }
  useEffect(()=>{
      fetchOptions()
  },[filter])

  return (
    <Layout>
      <FilterHeader type="recruitingGrid" label="Recruiting Grid" setFilter={setFilter} filter={filter} options = {options} />
      <RecruitingTable filter = {filter}/>
    </Layout>
  );
};
