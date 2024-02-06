import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { Layout } from 'components';
import { FilterHeader, } from 'views';
import { CareManagerFilter } from 'typings';
import { useAuth, useCompany } from 'hooks';
import { VendorTable } from 'views/CarePlanning/AwardManagement/VendorTable';
import { AwardManagementTable } from 'views/CarePlanning/AwardManagement/AwardManagementTable';
import { fil } from 'date-fns/locale';
import { formatName } from 'lib/common';

export const AwardManagement = ({ admin, type, carePartner }: any): JSX.Element => {
  const { user } = useAuth()
  const [awards, setAwards] = useState([])
  const [vendors, setVendors] = useState([])
  const awardsMemoized = useMemo(() => awards, [awards])
  const vendorsMemoized = useMemo(() => vendors, [vendors])

  const [filter, setFilter] = useState<any>({
    location: { id: user?.location?._id || '0', value: user?.location?.location || 'All' },
    careManager: { id: '0', value: 'All' },
    carePartner: { id: carePartner ? carePartner._id : 'All', value: carePartner ? formatName(carePartner.firstName, carePartner.lastName) : 'All' },
    dateRange: { id: 'All', value: 'All' },
    awardType: { id: 'All', value: 'All' },
    groupBy: { id: 'None', value: 'None' },
    startDate: { id: '', value: '' },
    endDate: { id: '', value: '' },
  });


  useEffect(() => {
    fetchVendors()
    fetchAwards()
  }, [user])


  const fetchAwards = useCallback(() => {
    const url = '/awards/Active';
    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setAwards(data)
      })
      .catch((error: any) => {
        toast.error('Failed to load Care Manager Activities.');
        console.error(error);
      });
  }, [filter]);

  const fetchVendors = async (status = 'Active') => {
    await API.get(`/vendors/${status}`)
      .then(rsp => {
        let data = rsp.data.data
        setVendors(data)
      })
  }
  return (
    <Layout>
      {!admin
        ?
        <> {type !== "carePartner" &&
          <FilterHeader type="awardManagement" setFilter={setFilter} filter={filter} options={awardsMemoized} />}
          <AwardManagementTable
            carePartner={carePartner}
            type={filter?.groupBy === 'None' ? "awards-grouped" : 'sensitive-issues'}
            awards={awardsMemoized} vendors={vendorsMemoized} filter={filter}
            data={[]} /></> : <VendorTable admin={admin}
            type="vendors" awards={awardsMemoized}
            vendors={vendorsMemoized}
            filter={filter}
            data={[]}
            fetchVendors={fetchVendors} />}
       </Layout>
  );
};
