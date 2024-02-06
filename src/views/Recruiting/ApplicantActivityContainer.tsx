import { useState, useEffect, useCallback } from 'react';
import { Box, } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import { Card, CardHeader, Modal, Spinner } from 'components';
import { formatDate, formatDateTime, formatName } from 'lib';
import ActivityModalContent from './ActivityModalContent';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import ApplicantActivityTabPanel from './ApplicantActivtyTabPanel';
import { ActivityTable } from './ActivityTable';
import { useParams } from 'react-router-dom';

export const ApplicantActivityContainer = ({ fetchActivities, applicantData, setApplicantData, tabs, title, defaultTab }: any) => {
  const [currentRow, setCurrentRow] = useState({});
  const [rows, setRows]: any[] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editOpenModal, setEditOpenModal] = useState(false);
  const [activityTypes, setActivityTypes] = useState<any[]>([]);
  const [currentActivity, setCurrentActivity] = useState(defaultTab)
  const applicantId = useParams();
  const { id } = applicantId;

  const formatRows = (rowsObj: any) => {
    return rowsObj.map((row: any) => ({
      activity: { value: row.type.type, style: { width: '10%' }, id: row.type._id },
      date: { value: formatDate(row.date), style: { width: '10%' } },
      time: { value: formatDateTime(row.date), style: { width: '10%' } },
      completedBy: {
        value: formatName(row.completedBy.firstName, row.completedBy.lastName),
        style: { width: '10%' },
        id: row.completedBy._id,
      },
      comments: { value: row.comments, style: { width: '60%' } },
      id: row._id,
      state:{
        value:{
          date:row.date
        }
      }
    }));
  };

  const fetchData = useCallback(() => {
    setLoading(true)
    API.get('applicants/activity')
      .then((rsp: any) => {
        const data = rsp.data.data;
        setActivityTypes(data);
        setLoading(false)
      })
      .catch((error: any) => {
        toast.error('Failed to load Activity types.');
        console.error(error);
        setLoading(false)
      });
  }, []);

  const handleCloseModal = () => {
    fetchActivities(currentActivity, id, setApplicantData);
    setOpenModal(false);
  };

  const editHandleCloseModel = () => {
    fetchActivities(currentActivity, id, setApplicantData);
    setEditOpenModal(false);
  };
  const editModal = (currentRowVal: any) => {
    setCurrentRow(currentRowVal);
    setEditOpenModal(true);
  };

  useEffect(() => {
    applicantData && setRows(formatRows(applicantData));
    fetchData();
  }, [setRows, applicantData, fetchData]);

  return (
    <>
      <Card>
        <CardHeader
          title={title}
          setOpenModal={setOpenModal}
          expanded={expanded}
          setExpanded={setExpanded}
          expandable={false}
          type={''}
          setType={() => { }}
        />
        <Modal open={openModal} closeHandler={handleCloseModal}>
          <ActivityModalContent closeMe={handleCloseModal} options={activityTypes} />
        </Modal>
        {loading ? (
          <Spinner />
        ) : (
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
              <Modal open={editOpenModal} closeHandler={editHandleCloseModel}>
                <ActivityModalContent closeMe={editHandleCloseModel} currentRow={currentRow} options={activityTypes} />
              </Modal>
            </Box>
            <ApplicantActivityTabPanel activityType={currentActivity} tabs={tabs} TableToRender={(currentActivity: any) => <ActivityTable editModal={editModal} activityType={currentActivity} setCurrentActivity={setCurrentActivity} />
            } />
          </CardContent>
        )}
      </Card>
    </>
  );
};
