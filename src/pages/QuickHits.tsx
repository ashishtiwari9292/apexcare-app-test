import { useState, useEffect } from 'react';
import {
  FilterHeader,
  CurrentNotes,
  SensitiveIssues,
  SchedulingGap,
  HealthCheck,
  KeepInView,
  CareManagerActivities,
} from 'views';
import { Layout } from 'components';
import { QuickHitsFilter } from 'typings';
import { quickHitsFilter } from 'lib';
import { useAuth } from 'hooks';

export const QuickHits = (): JSX.Element => {

  const { user } = useAuth();
  const [filter, setFilter] = useState<QuickHitsFilter>({...quickHitsFilter, location:{id:user.location._id, location: user.location.location}});

  useEffect(() => {
    const updated = {
      ...filter,
      location: { id: user.location._id, value: user.location.location },
    };
    setFilter(updated);
  }, [user]);

  return (
    <Layout>
      <FilterHeader type="quickHits" label="Quick Hits" setFilter={setFilter} filter={filter} />
      <CurrentNotes filter={filter} />
      <SensitiveIssues filter={filter} />
      <SchedulingGap filter={filter} />
      <HealthCheck filter={filter} />
      <KeepInView filter={filter} />
      <CareManagerActivities filter={filter} />
    </Layout>
  );
};
