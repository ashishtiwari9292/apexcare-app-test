import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Card, Spinner, NoData, Table, Modal } from 'components';
import API from 'services/AxiosConfig';
import { GrFlagFill } from 'react-icons/gr';
import { formatDate, formatName, sort } from 'lib';
import { Link } from 'react-router-dom';
import ReferralPartnersModal from './ReferralPartnersModal';
import { minWidth } from '@mui/system';

export const ReferralPartnersTable = ({ options, filter, updateData, detail = false, id, addOpenModal, setAddOpenModal }: any) => {
  const [rows, setRows]: any[] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateRows = (data: any) =>
    data.map((rowObj: any) => ({
      flag: {
        value: rowObj.flagged ? <GrFlagFill color="red" /> : <></>,
        style: { width: '1%' },
        selected: rowObj.flagged === true,
      },
      status: { value: rowObj.status ? 'Active' : 'Inactive', style: { width: '2%' } },
      location: { value: rowObj.location.location, style: { width: '5%' } },
      companyName: { value: rowObj?.companyName?.companyName, style: { width: '15%' } },
      fullName: { value: rowObj.lastName ? formatName(rowObj.firstName, rowObj.lastName): rowObj.firstName, style: { width: '10%' } },
      title: { value: rowObj.title, style: { width: '10%' } },
      phone: { value: rowObj.mobilePhone, style: { width: '8%', minWidth: '90px' } },
      comments: { value: rowObj.comments, style: { width: '40%', whitespace: 'pre-wrap' } },
      state: { id: rowObj?._id, companName: rowObj.companyName }
    }));
  const generateDetailRows = (data: any) => {
    const activeData: any = []
    const inactiveData: any = []
    data.map((rowObj: any) => {
      let current: any = rowObj.status ? activeData : inactiveData
      current.push({
        flag: {
          value: rowObj.flagged ? <GrFlagFill color="red" /> : <></>,
          style: { width: '1%' },
          selected: rowObj.flagged === true,
        },
        location: { value: rowObj.location.location, style: { width: '10%' } },
        fullName: { value: (<Link className='applicant-name-link' to={`/marketing/referral-partners/${rowObj._id}`}>{formatName(rowObj?.firstName, rowObj?.lastName)}</Link>), selected:formatName(rowObj?.firstName, rowObj?.lastName), style: { width: '15%' } },
        title: { value: rowObj.title, style: { width: '12%' } },
        status: { value: rowObj.status ? 'Active' : 'Inactive', style: { width: '8%' } },
        activeDate: { value: rowObj.activeDate ? formatDate(rowObj?.activeDate) : '', style: { width: '10%' } },
        inactiveDate: { value: rowObj?.inactiveDate ? formatDate(rowObj?.inactiveDate) : '', style: { width: '10%' } },
        comments: { value: rowObj.comments, style: { width: '50%', whitespace: 'pre-wrap' } },
        state: { id: rowObj?._id, companName: rowObj.companyName }
      })
    })
    return [
      {
      location: 'Active',
        data:activeData.sort((a:any,b:any)=> a.fullName?.selected - b.fullName?.selected),
        count: activeData.length
      },
      {
        location:'Inactive',
        data:inactiveData.sort((a:any,b:any)=> a.fullName?.selected - b.fullName?.selected),
        count: inactiveData.length
      }
    ]

  };
  const handleCloseModal = () => {
    setAddOpenModal(false)
    fetchData(filter)
  }
  const fetchData = useCallback((filter) => {
    setLoading(true)
    const url = detail ? `referral-partners?company=${id}` : `referral-partners?status=${filter?.status?.value}&location=${filter?.location?.value}&companyName=${filter?.companyName?.value}&referralPartner=${filter?.referralPartner?.value}&flag=${filter?.flag}`
    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setRows(detail ? generateDetailRows(data) : generateRows(data))
        setLoading(false)
      })
      .catch((error: any) => {
        toast.error('Failed to get Referral Partners.');
        console.error(error);
        setLoading(false)
      });
  }, []);

  const handleSort = (sortVal: string, type: string, ascending: boolean) => {
    setRows(sort(rows, sortVal, type, ascending, 'prospects'));
  };

  useEffect(() => {
    fetchData(filter)
  }, [filter])

  return (
    <div style={{ paddingBottom: '15px' }}>
      {loading && <Spinner />}
      <Modal open={addOpenModal} closeHandler={handleCloseModal} styles={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        height: '90vh',
        overflow: 'scroll'
      }
    }>
        <ReferralPartnersModal type="Referral Partners" closeMe={handleCloseModal} />
      </Modal>
        {(!loading && rows.length === 0) && <NoData />}
      {(!loading && rows.length > 0) && (
        <Table
          columns={detail ? ['Flag', ' Location', 'Full Name', 'Title', 'Status', 'Active Date', 'Inactive Date', 'Comments', '', ''] : ['Flag', 'Status', 'Location', 'Company', 'Name', 'Title', 'Phone', 'Comments']}
          rows={rows}
          type={detail ? "referral-partners-detail" : "referral-partners"}
          hideArchive={true}
          rowsPer={25}
          handleSort={handleSort}
        />
      )}
    </div>
  );
};