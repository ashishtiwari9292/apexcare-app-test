import { useState, useEffect } from 'react';
import { Modal, NoData, Spinner, Table } from 'components';
import { useParams } from 'react-router-dom';
import { formatDate, formatName, sort } from 'lib';
import { fetchProspectActivities } from 'lib';
import ProspectActivityModal from './ProspectActivityModal';

export const ProspectActivityTable = ({openModal,setOpenModal, activityTypes, activityType, setCurrentActivity, currentActivity }: any) => {
    const { prospectId } = useParams();
    const [rows, setRows]: any[] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editModal, setEditModal] = useState(false)
    const [currentRow, setCurrentRow] = useState()

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
    const handleCloseModal: any = () => {
        setOpenModal(false)
        fetchProspectActivities(currentActivity, prospectId, setRows, setLoading, formatRows)
    }

    const handleEditModal: any = () => {
        setOpenModal(false)
    }

    const handleCloseEditModal: any = (currentRowVal: any) => {
        setCurrentRow(currentRowVal);
        setEditModal(false);
        fetchProspectActivities(currentActivity, prospectId, setRows, setLoading, formatRows);

    };
    const handleEdit = (row: any) => {
        setCurrentRow(row)
        setEditModal(true)
    }


    const handleSort = (sortVal: string, type: string, ascending: boolean) => {
        setRows(sort(rows, sortVal, type, ascending, 'Activity Table'));
    };


    useEffect(() => {
        setCurrentActivity(activityType)
        fetchProspectActivities(currentActivity, prospectId, setRows, setLoading, formatRows);
    }, [activityType]);

    return (
        <>
            {loading ? (
                <Spinner />
            ) : rows.length > 0 ? (
                <>
                    <Modal open={openModal} closeHandler={handleCloseModal}>
                        <ProspectActivityModal closeMe={handleCloseModal} options={activityTypes} />
                    </Modal>
                    <Modal open={editModal} closeHandler={handleCloseEditModal}>
                        <ProspectActivityModal closeMe={handleCloseEditModal} currentRow={currentRow} options={activityTypes} />
                    </Modal>
                    <Table
                        columns={['Activity', 'Date', 'Time', 'Completed By', 'Comments', '']}
                        rows={rows}
                        handleArchive={() => { }}
                        handleEdit={handleEdit}
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
