import { useState, useEffect } from 'react';
import { Modal, NoData, Spinner, Table } from 'components';
import { useParams } from 'react-router-dom';
import { formatDate, formatName, sort } from 'lib';
import { fetchReferralPartnerActivities } from 'lib';
import ReferralPartnerActivityModal from './ReferralPartnerActivityModal';
import API from 'services/AxiosConfig';
import ReferralPartnersModal from './ReferralPartnersModal';

export const ReferralPartnersActivityTable = ({ currentActivity, openModal = false, setOpenModal = () => { },}: any) => {
    const applicantId = useParams();
    const { referralPartnerId } = applicantId;
    const [rows, setRows]: any[] = useState([123]);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([])
    const [currentRow, setCurrentRow] = useState([])
    const [openEditModal, setOpenEditModal] = useState(false)

    const formatRows = (rowsObj: any) => {
        return rowsObj.map((row: any) => ({
            activity: { value: row.type.type, style: { width: '10%' }, id: row.type._id },
            date: { value: formatDate(row.date), style: { width: '10%' } },
            time: { value: new Date(row.date).toLocaleTimeString(), style: { width: '10%' } },
            completedBy: {
                value: formatName(row.completedBy.firstName, row.completedBy.lastName),
                style: { width: '10%' },
                id: row.completedBy._id,
            },
            comments: { value: row.comments, style: { width: '60%' } },

            id: row._id,
            state: {
                value: {
                    time: new Date(row.date).getTime()
                }
            }

        }));
    };

    const handleSort = (sortVal: string, type: string, ascending: boolean) => {
        setRows(sort(rows, sortVal, type, ascending, 'Activity Table'));
    };

    const handleCloseModal = () => {
        setOpenModal(false)
        fetchReferralPartnerActivities(currentActivity, referralPartnerId, setRows, formatRows)
    }

    const handleCloseEditModal = () => {
        setOpenEditModal(false)
        fetchReferralPartnerActivities(currentActivity, referralPartnerId, setRows, formatRows)
    }

    const handleOpenEditModal = (row: any) => {
        setOpenEditModal(true)
        setCurrentRow(row)
    }

    const fetchActivities = async () => {
        try {
            const act = await API.get('/referral-partners/activity/types')
            setOptions(act.data.data)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        fetchActivities()
    }, [])

    useEffect(() => {
        fetchReferralPartnerActivities(currentActivity, referralPartnerId, setRows, formatRows)
    }, [currentActivity]);

    return (
        <>
            {loading ? (
                <Spinner />
            ) : rows.length > 0 ? (
                <>
                    <Modal open={openModal} closeHandler={handleCloseModal} styles={{
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
                        <ReferralPartnersModal type = "Referral Partners" closeMe={handleCloseModal} />
                    </Modal>
                    <Modal open={openModal} closeHandler={handleCloseModal} styles={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '50%',
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                        overflow: 'scroll'
                    }
                    }>
                        <ReferralPartnerActivityModal closeMe={handleCloseModal} options={options} />
                    </Modal>
                    <Modal open={openEditModal} closeHandler={handleCloseEditModal} styles={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '50%',
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                        overflow: 'scroll'
                    }
                    }>
                        <ReferralPartnerActivityModal closeMe={handleCloseEditModal} options={options} currentRow={currentRow} />
                    </Modal>
                    <Table
                        columns={['Activity', 'Date', 'Time', 'Completed By', 'Comments', '']}
                        rows={rows}
                        handleArchive={() => { }}
                        handleEdit={handleOpenEditModal}
                        type={'applicantDetails'}
                        handleSort={handleSort}
                    />
                </>
            ) : (
                <NoData />
            )}
        </>
    );
};



