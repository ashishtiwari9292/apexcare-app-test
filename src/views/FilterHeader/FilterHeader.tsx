
import { useCompany, useAuth, } from 'hooks';
import { formatName } from 'lib';
import { InputGroup } from './InputGroup';
import React, { useEffect, useState } from 'react'
import API from 'services/AxiosConfig';
import { useFilter } from '../../pages/Marketing/ReferralPartners/ReferralFilterContext';

interface FilterHeaderProps {
  type: string;
  filter?: any;
  setFilter: (filter: any) => void;
  label?: string;
  options?: any;
  maxWidth?: any;
}

export const FilterHeader = ({ type, filter, setFilter, label = '', options, maxWidth = 'xl' }: FilterHeaderProps): JSX.Element => {

  const { referralFilter, prospectFilter, updateProspectFilter, updateFilter, resetFilter, updateComponent } = useFilter();
  const { locations, users, careManagerActivities } = useCompany();
  const locationSelect: any = {
    type: 'select',
    name: 'location',
    label: 'Location',
    items: [{ key: '0', label: locations.length === 0 ? 'None' : "All" }, ...locations.map((loc: any) => ({ key: loc._id, label: loc.location }))]
  };

  const [partners, setPartners] = useState([])
  const [companies, setCompanies] = useState([])
  const [prospects, setProspects] = useState([])
  const [companyTypes, setCompanyTypes] = useState([])
  const [stageOptions, setStageOptions] = useState([])
  const [clients, setClients] = useState([])
  const [carePartners, setCarePartners] = useState([])

  const getStageOptions = async () => {
    try {
      const p = await API.get('/stage-options/activity/search/Active')
      setStageOptions(p.data.data)
    } catch (err) {
      console.log(err)
    }
  }
  const fetchCompaniesTypes = async () => {
    try {
      const comp = await API.get('referral-partners/types/listing')
      comp && (setCompanyTypes(comp.data.data))
    } catch (err) {
      console.log(err)
    }

  }
  const syncData = async () => {
    const clientsData = await API.get('client');
    setClients(clientsData.data.data);
    const carePartnersData = await API.get('care-partner');
    setCarePartners(carePartnersData.data.data);
  }

  const getReferralPartners = async () => {
    try {
      const p = await API.get('referral-partners')
      setPartners(p.data.data)
    } catch (err) {
      console.log(err)
    }
  }
  const getCompanies = async () => {
    try {
      const p = await API.get('referral-partners/companies/listing')
      setCompanies(p.data.data)
    } catch (err) {
      console.log(err)
    }
  }
  const getAllProspects = async () => {
    try {
      const p = await API.get('prospects/all')
      setProspects(p.data.data)
    } catch (err) {
      console.log(err)
    }
  }
  useEffect(() => {
    if (type === 'marketing-activities' || type === 'marketingManagement' || type === 'Referral Partners') {
      getReferralPartners()
      getCompanies()
    }
    if (type === 'prospects' || type === 'marketingManagement') {
      getAllProspects()
      getStageOptions()
    }
    if (type === 'Companies') {
      getCompanies()
      fetchCompaniesTypes()
    }
    if(type ==='clients'|| type === 'carePartners'){
      syncData()
    }
    console.log('i ran aswell')

  }, [type, updateComponent])
  if (type === 'quickHits') {
    return (
      <InputGroup
        filter={filter}
        setFilter={setFilter}
        label={label}
        styles={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '25px', flexWrap: 'wrap' }}
        inputs={[
          { type: 'checkbox', name: 'flag', label: 'Flag' },
          locationSelect,
          {
            type: 'autoComplete',
            name: 'careManager',
            label: 'Care Manager',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              { key: '0', label: 'All' },
              ...users.map((user: any) => ({ label: formatName(user.firstName, user.lastName), id: user._id })),
            ],
          },
          {
            type: 'select',
            name: 'status',
            label: 'Status',
            items: [
              { key: 'Open', label: 'Open' },
              { key: 'Closed', label: 'Closed' },
            ],
          },
          {
            type: 'select',
            name: 'dateRange',
            label: 'Date Range',
            items: [
              { key: 'All', label: 'All' },
              { key: '7', label: 'Last 7 Days' },
              { key: '14', label: 'Last 14 Days' },
              { key: '30', label: 'Last 30 Days' },
              { key: 'Custom', label: 'Custom' },
            ],
          },
          { type: 'customDateRange', condition: 'custom', conditionTarget: 'dateRange' },
          { type: 'button', label: 'Search' },
        ]}
      />
    );
  }
  if (type === 'clients') {
    return (
      <InputGroup
        filter={filter}
        setFilter={setFilter}
        styles={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', gap: '25px' }}
        inputs={[
          {
            type: 'autoComplete',
            name: 'client',
            label: 'Client Name',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              { label: '', id: '' },
              ...clients.map((client: any) => ({ label: formatName(client.firstName, client.lastName), item: client._id }))
            ]
          },
          locationSelect,
          {
            type: 'select',
            name: 'status',
            label: 'Status',
            items: [
              { key: 'Active', label: 'Active' },
              { key: 'Inactive', label: 'Inactive' },
            ],
          },
          {
            type: 'autoComplete',
            name: 'careManager',
            label: 'Care Manager',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              { key: '0', label: 'All' },
              ...users.map((user: any) => ({ label: formatName(user.firstName, user.lastName), item: user._id })),
            ],
          },
          { type: 'button', label: 'Search' },
        ]}
      />
    );
  }
  if (type === 'carePartners') {
    return (
      <InputGroup
        filter={filter}
        setFilter={setFilter}
        styles={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', gap: '25px' }}
        inputs={[
          {
            type: 'autoComplete',
            name: 'carePartner',
            label: 'Care Partner Name',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              ...carePartners.map((carePartner: any) => ({ label: formatName(carePartner.firstName, carePartner.lastName), item: carePartner._id }))
            ]
          },
          locationSelect,
          {
            type: 'select',
            name: 'status',
            label: 'Status',
            items: [
              { key: 'Active', label: 'Active' },
              { key: 'Inactive', label: 'Inactive' },
            ],
          },
          { type: 'button', label: 'Search' },
        ]}
      />
    );
  }
  if (type === 'applicants' && options?.length) {
    return (
      <InputGroup
        filter={filter}
        setFilter={setFilter}
        styles={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'center', gap: '25px' }}
        inputs={[
          { type: 'checkbox', name: 'flag', label: 'Flag' },
          {
            type: 'textField',
            name: 'name',
            label: 'Name',
            styles: { minWidth: 250, maxWidth: '100%' },
          },
          locationSelect,
          {
            type: 'select',
            name: 'status',
            label: 'Status',

            items: [
              { key: 'All', label: 'All' },
              { key: 'Active', label: 'Active' },
              { key: 'inactive', label: 'Inactive' },
            ],
          },
          {
            type: 'select',
            name: 'stage',
            label: 'Stage',
            items: [{ key: '', label: 'All' }, ...options.map((s: any) => ({ key: s.stage, label: s.stage }))],
          },
          {
            type: 'select',
            name: 'dateRange',
            label: 'Date Range',
            items: [
              { key: 'All', label: 'All' },
              { key: '7', label: 'Last 7 Days' },
              { key: '14', label: 'Last 14 Days' },
              { key: '30', label: 'Last 30 Days' },
              { key: 'Custom', label: 'Custom' },
            ],
          },
          { type: 'customDateRange', condition: 'custom', conditionTarget: 'dateRange' },
          { type: 'button', label: 'Search' },
        ]}
      />
    );
  }
  if (type === 'careManagement') {
    return (
      <InputGroup
        filter={filter}
        setFilter={setFilter}
        label={'Care Management'}
        styles={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'center', gap: '25px' }}
        inputs={[{
          type: 'autoComplete',
          name: 'careManager',
          label: 'Care Manager',
          styles: { minWidth: 250, maxWidth: '100%' },
          options: [
            { key: '0', label: 'All' },
            ...users.map((user: any) => ({ label: formatName(user.firstName, user.lastName), id: user._id })),
          ],
        },
        {
          type: 'select',
          name: 'dateRange',
          label: 'Date Range',
          items: [
            { key: 'All', label: 'All' },
            { key: '-7', label: 'Next 7 Days' },
            { key: '-14', label: 'Next 14 Days' },
            { key: '-30', label: 'Next 30 Days' },
          ],
        },
          locationSelect,
        {
          type: 'select',
          name: 'activity',
          label: 'Activity',
          items: [
            { key: 'All', label: 'All' },
            ...careManagerActivities.map(({ activity, _id }: any) => ({
              key: _id,
              label: activity
            }))
          ],
        },
        {
          type: 'select',
          name: 'status',
          label: 'Status',
          items: [
            { key: 'All', label: 'All' },
            { key: 'Open', label: 'Open' },
            { key: 'Closed', label: 'Closed' },
          ],
        },
        {
          type: 'autoComplete',
          name: 'carePartner',
          label: 'Care Partner',
          styles: { minWidth: 250, maxWidth: '100%' },
          options: [
            { key: '0', label: 'All' },
            ...carePartners.map((user: any) => ({ label: formatName(user.firstName, user.lastName), id: user._id })),
          ],
        },
        {
          type: 'autoComplete',
          name: 'client',
          label: 'Client Name',
          styles: { minWidth: 250, maxWidth: '100%' },
          options: [
            { label: '', id: '' },
            ...clients.map((client: any) => ({ label: formatName(client.firstName, client.lastName), item: client._id }))
          ]
        },
        {
          type: 'select',
          name: 'groupBy',
          label: 'Group By',
          items: [
            { key: 'None', label: 'None' },
            { key: 'Care Manager', label: 'Care Manager' },
            { key: 'Activity', label: 'Activity' },
            { key: 'Client', label: 'Client' },
            { key: 'Care Partner', label: 'Care Partner' },
            { key: 'Week', label: 'Week' },
            { key: 'Day', label: 'Day' },
          ],
        },
        { type: 'button', label: 'Search' },
        ]}
      />
    )
  }
  if (type === 'noScheduleReport') {
    return (
      <InputGroup
        filter={filter}
        setFilter={setFilter}
        label=''
        styles={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'center', gap: '25px' }}
        inputs={[
          {
            type: 'select',
            name: 'numberOfDays',
            label: 'Number of Days',
            items: [
              { key: '1', label: '30 Days' },
              { key: '2', label: '60 Days' },
              { key: '6', label: '180 Days' },
              { key: 'Custom', label: 'Custom' }
            ],
          },
          { type: 'customMonthField' },
          { type: 'button', label: 'Search' },
        ]}
      />
    )
  }
  if (type === 'awardManagement') {
    return (
      <div style={{ marginTop: '5%' }}>
        <InputGroup
          filter={filter}
          setFilter={setFilter}
          label='      '
          styles={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'center', gap: '25px' }}
          inputs={[
            locationSelect,
            {
              type: 'select',
              name: 'dateRange',
              label: 'Date Range',
              items: [
                { key: 'All', label: 'All' },
                { key: '3', label: 'Last 3 Months' },
                { key: '6', label: 'Last 6 Months' },
                { key: '9', label: 'Last 9 Months' },
                { key: '12', label: 'Last 12 Months' },
                { key: 'Custom', label: 'Custom' }

              ],
            },
            { type: 'customDateRange', condition: 'custom', conditionTarget: 'dateRange' },
            {
              type: 'select',
              name: 'awardType',
              label: 'Award Type',
              items: [
                { key: 'All', label: 'All' },
                ...options?.map((rowObj: any) => {
                  return { key: rowObj._id, label: rowObj.awardName }
                })
              ],
            },
            {
              type: 'autoComplete',
              name: 'careManager',
              label: 'Care Manager',
              styles: { minWidth: 250, maxWidth: '100%' },
              options: [
                { key: '0', label: 'All' },
                ...users.map((user: any) => ({ label: formatName(user.firstName, user.lastName), id: user._id })),
              ],
            },
            {
              type: 'autoComplete',
              name: 'carePartner',
              label: 'Care Partner',
              styles: { minWidth: 250, maxWidth: '100%' },
              options: [
                { key: '0', label: 'All' },
                ...carePartners.map((user: any) => ({ label: formatName(user.firstName, user.lastName), id: user._id })),
              ],
            },
            {
              type: 'select',
              name: 'groupBy',
              label: 'Group By',
              items: [
                { key: 'None', label: 'None' },
                { key: 'Location', label: 'Location' },
                { key: 'Award Type', label: 'Award Type' },
                { key: 'Month', label: 'Month' },
                { key: 'Care Manager', label: 'Care Manager' },
              ],
            },
            { type: 'button', label: 'Search' },
          ]}
        />
      </div>
    )
  }
  if (type === 'recruitingGrid') {
    return (
      <InputGroup
        filter={filter}
        setFilter={setFilter}
        label={label}
        styles={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '25px', flexWrap: 'wrap' }}
        inputs={[
          { type: 'checkbox', name: 'flag', label: 'Flag' },
          locationSelect,
          {
            type: 'select',
            name: 'status',
            label: 'Status',
            items: [
              { key: 'Active', label: 'Active' },
              { key: 'Inactive', label: 'Inactive' },
            ],
          },
          {
            type: 'select',
            name: 'stage',
            label: 'Stage',
            items: [{ key: '', label: 'All' }, ...options.map((s: any) => ({ key: s.stage, label: s.stage }))],
          },
          // {
          //   type: 'select',
          //   name: 'dateRange',
          //   label: 'Date Range',
          //   items: [
          //     { key: 'All', label: 'All' },
          //     { key: '7', label: 'Last 7 Days' },
          //     { key: '14', label: 'Last 14 Days' },
          //     { key: '30', label: 'Last 30 Days' },
          //     { key: 'Custom', label: 'Custom' },
          //   ],
          // },
          // { type: 'customDateRange', condition: 'custom', conditionTarget: 'dateRange' },
          { type: 'button', label: 'Search' },
        ]}
      />
    );
  }
  if (type === 'userManagement') {
    return (
      <InputGroup
        filter={filter}
        setFilter={setFilter}
        label={label}
        styles={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '25px', flexWrap: 'wrap' }}
        inputs={[
          locationSelect,
          {
            type: 'select',
            name: 'status',
            label: 'Status',
            items: [
              { key: 'Active', label: 'Active' },
              { key: 'Inactive', label: 'Inactive' },
            ],
          },
          { type: 'button', label: 'Search' },
        ]}
      />
    );
  }
  if (type === 'Referral Partners') {
    return (
      <InputGroup
        filter={referralFilter}
        setFilter={updateFilter}
        label={label}
        styles={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '25px', flexWrap: 'wrap' }}
        maxWidth={false}
        inputs={[
          { type: 'checkbox', name: 'flag', label: 'Flag' },
          // {
          //   type: 'textField',
          //   name: 'referralPartner',
          //   label: 'Referral Partner Name',
          //   styles: { minWidth: 250, maxWidth: '100%' },
          // },
          {
            type: 'autoComplete',
            name: 'referralPartner',
            label: 'Referral Partner',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              { key: 'All', label: 'All' },
              ...partners.map((user: any) => ({ label: formatName(user.firstName, user.lastName), id: user._id })),
            ],
          },
          {
            type: 'autoComplete',
            name: 'companyName',
            label: 'Company Name',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              { key: 'All', label: 'All' },
              ...companies.map((user: any) => ({ label: user.companyName, id: user._id })),
            ],
          },
          {
            type: 'select',
            name: 'status',
            label: 'Status',
            items: [
              { key: 'Active', label: 'Active' },
              { key: 'Inactive', label: 'Inactive' },
            ],
          },
          locationSelect,
          {
            type: 'select',
            name: 'groupBy',
            label: 'Group By',
            styles: { minWidth: 250, maxWidth: '100%' },
            items: ['City', 'Referral Potential', 'Visit Frequency', 'Company Type', 'None'].map((item: any) => ({ label: item, key: item }))
          },
          { type: 'button', label: 'Search' },
        ]}
      />
    );
  }
  if (type === 'Companies') {
    return (
      <InputGroup
        filter={referralFilter}
        setFilter={updateFilter}
        label={label}
        styles={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '25px', flexWrap: 'wrap' }}
        maxWidth={false}
        inputs={[
          { type: 'checkbox', name: 'flag', label: 'Flag' },
          {
            type: 'autoComplete',
            name: 'companyName',
            label: 'Company Name',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              { key: 'All', label: 'All' },
              ...companies.map((user: any) => ({ label: user.companyName, id: user._id })),
            ],
          },
          {
            type: 'select',
            name: 'status',
            label: 'Status',
            items: [
              { key: 'Active', label: 'Active' },
              { key: 'Inactive', label: 'Inactive' },
            ],
          },
          {
            type: 'select',
            name: 'companyType',
            label: 'Company Type',
            styles: { minWidth: 250 },
            items:
              [{ key: 'All', label: 'All' }, ...companyTypes.map((s: any) => ({ key: s._id, label: s.companyType }))]
          },
          locationSelect,
          {
            type: 'select',
            name: 'groupBy',
            label: 'Group By',
            styles: { minWidth: 250, maxWidth: '100%' },
            items: ['City', "Company Type", 'None'].map((item: any) => ({ label: item, key: item }))
          },
          { type: 'button', label: 'Search' },
        ]}
      />
    );
  }
  if (type === 'prospects') {
    return (
      <InputGroup
        filter={prospectFilter}
        setFilter={updateProspectFilter}
        label={label}
        styles={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '25px', flexWrap: 'wrap' }}
        inputs={[
          { type: 'checkbox', name: 'flag', label: 'Flag' },
          {
            type: 'autoComplete',
            name: 'prospect',
            label: 'Prospect',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              { label: '', id: '' },
              ...prospects.map((prospect: any) => {
                return { label: prospect.fullName, id: prospect._id }
              })
            ]
          },
          locationSelect,
          {
            type: 'select',
            name: 'status',
            label: 'Status',
            items: [
              { key: 'Open', label: 'Active' },
              { key: 'Closed', label: 'Inactive' },
            ],
          },
          {
            type: 'select',
            name: 'stage',
            label: 'Stage',
            items:
              [{ key: 'All', label: 'All' }, ...stageOptions.map((s: any) => ({ key: s._id, label: s.type }))]
          },
          {
            type: 'select',
            name: 'dateRange',
            label: 'Date Range',
            items: [
              { key: 'All', label: 'All' },
              { key: '7', label: 'Last 7 Days' },
              { key: '14', label: 'Last 14 Days' },
              { key: '30', label: 'Last 30 Days' },
              { key: 'Custom', label: 'Custom' },
            ],
          },
          { type: 'customDateRange', condition: 'custom', conditionTarget: 'dateRange' },
          { type: 'button', label: 'Search' },
        ]}
      />
    );
  }
  if (type === 'marketing-activities') {
    return (
      <InputGroup
        filter={filter}
        setFilter={setFilter}
        label={label}
        styles={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '25px', flexWrap: 'wrap' }}
        inputs={[
          locationSelect,
          {
            type: 'select',
            name: 'dateRange',
            label: 'Date Range',
            items: [
              { key: 'All', label: 'All' },
              { key: '7', label: 'Last 7 Days' },
              { key: '14', label: 'Last 14 Days' },
              { key: '30', label: 'Last 30 Days' },
              { key: 'Custom', label: 'Custom' },
            ],
          },
          { type: 'customDateRange', condition: 'custom', conditionTarget: 'dateRange' },
          {
            type: 'select',
            name: 'activity',
            label: 'Activity Type',
            styles: { minWidth: 250, maxWidth: '100%' },
            items: options.activityType.map((activity: any, idx: any) => {
              return ({ key: activity, label: activity })
            })
          },
          {
            type: 'autoComplete',
            name: 'marketingManager',
            label: 'Created By',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              { key: 'All', label: 'All' },
              ...users.map((user: any) => ({ label: formatName(user.firstName, user.lastName), id: user._id })),
            ],
          },
          {
            type: 'autoComplete',
            name: 'referralPartner',
            label: 'Referral Partner',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              { key: 'All', label: 'All' },
              ...partners.map((user: any) => ({ label: formatName(user.firstName, user.lastName), id: user._id })),
            ],
          },
          {
            type: 'autoComplete',
            name: 'company',
            label: 'Company',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              { key: 'All', label: 'All' },
              ...companies.map((user: any) => ({ label: user.companyName, id: user._id })),
            ],
          },
          {
            type: 'select',
            name: 'groupBy',
            label: 'Group By',
            styles: { minWidth: 250, maxWidth: '100%' },
            items: options.groupBy.map((activity: any, idx: any) => {
              return ({ key: activity, label: activity })
            })
          },
          { type: 'button', label: 'Search' },
        ]}
      />
    );
  }
  if (type === 'marketingManagement') {
    return (
      <InputGroup
        filter={filter}
        setFilter={setFilter}
        label={label}
        styles={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '25px', flexWrap: 'wrap', width: '100vw !important' }}
        inputs={[
          {
            type: 'autoComplete',
            name: 'marketingManager',
            label: 'Marketing Manager',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              { key: 'All', label: 'All' },
              ...users.map((user: any) => ({ label: formatName(user.firstName, user.lastName), id: user._id })),
            ],
          },
          {
            type: 'select',
            name: 'dateRange',
            label: 'Date Range',
            items: [
              { key: 'All', label: 'All' },
              { key: '7', label: 'Next 7 Days' },
              { key: '14', label: 'Next 14 Days' },
              { key: '30', label: 'Next 30 Days' },
              { key: 'Custom', label: 'Custom' },
            ],
          },
          locationSelect,
          { type: 'customDateRange', condition: 'custom', conditionTarget: 'dateRange' },
          {
            type: 'autoComplete',
            name: 'referralPartner',
            label: 'Referral Partner',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              { key: 'All', label: 'All' },
              ...partners.map((user: any) => ({ label: formatName(user.firstName, user.lastName), id: user._id })),
            ],
          },
          {
            type: 'autoComplete',
            name: 'company',
            label: 'Company',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              { key: 'All', label: 'All' },
              ...companies.map((user: any) => ({ label: user?.companyName, id: user._id })),
            ],
          },
          {
            type: 'autoComplete',
            name: 'prospect',
            label: 'Prospect',
            styles: { minWidth: 250, maxWidth: '100%' },
            options: [
              { key: 'All', label: 'All' },
              ...prospects.map((prospect: any) => ({ label: prospect.fullName, id: prospect._id })),
            ],
          },
          {
            type: 'select',
            name: 'groupBy',
            label: 'Group By',
            items: [
              ...['None', 'Marketing Manager', 'Activity Type', 'Referral Partner', 'Company', 'Prospect', 'Day', 'Week'].map((item: any) => {
                return { key: item, label: item }
              })
            ],
          },
          { type: 'button', label: 'Search' },
        ]}
      />
    );
  }

  return <></>;
};
