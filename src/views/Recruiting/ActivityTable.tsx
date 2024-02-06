import { useState, useEffect } from 'react';
import { NoData, Spinner, Table } from 'components';
import { useParams } from 'react-router-dom';
import { formatDate, formatName, sort } from 'lib';
import { fetchActivities } from 'lib';

export const ActivityTable = ({ editModal, activityType, setCurrentActivity }: any) => {
    const applicantId = useParams();
    const { id } = applicantId;
    const [rows, setRows]: any[] = useState([]);
    const [loading, setLoading] = useState(false);

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

    useEffect(() => {
        setCurrentActivity(activityType)
        fetchActivities(activityType, id, setRows, formatRows);
    }, [activityType]);

    return (
        <>
            {loading ? (
                <Spinner />
            ) : rows.length > 0 ? (
                <Table
                    columns={['Activity', 'Date', 'Time', 'Completed By', 'Comments', '']}
                    rows={rows}
                    handleArchive={() => { }}
                    handleEdit={editModal}
                    type={'applicantDetails'}
                    handleSort={handleSort}
                />
            ) : (
                <NoData />
            )}
        </>
    );
};
