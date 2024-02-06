import { useState, useEffect } from 'react';
import { Layout } from 'components';
import { ApplicantsTable } from 'views/Recruiting/ApplicantsTable';
import { FilterHeader } from 'views';
import { useAuth } from 'hooks';
import { fetchStages, fetchSources } from 'lib';

export function Applicants() {
  const { user } = useAuth()
  const [filter, setFilter]: any = useState({
    flag: false,
    name: { id: '', value: '' },
    location: { id: user?.location?._id || '0', value: user?.location?.location || '' },
    status: { id: 'Active', value: 'Active' },
    stage: { id: '', value: 'All' },
    dateRange: { id: 'All', value: 'All' },
    startDate: { id: '', value: '' },
    endDate: { id: '', value: '' },
  });
  const [stages, setStages] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    fetchStages(setStages);
    fetchSources(setSources)
  }, []);

  return (
    <Layout>
      <FilterHeader setFilter={setFilter} filter={filter} type="applicants" options={stages} />
      <ApplicantsTable filter={filter} options={{ stages, sources }} />
    </Layout>
  );
}
