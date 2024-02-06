import { useState, useEffect } from 'react';
import { Card, CardHeader, Modal, NoData, Spinner } from 'components';
import API from '../../services/AxiosConfig';
import { ApplicantsCards } from './ApplicantsCards';
import { useParams } from 'react-router-dom';
import ApplicantProgressModalContent from './ApplicantProgressModalContent';

export const ApplicantProgress = ({ admin, title }:any) => {
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true);
  const [progressData, setProgressData] = useState<any>([]);
  const userId = useParams();
  const { id } = userId;

  const handleCloseModal = () => {
    setOpenModal(false);
    fetchData();
  };

  const fetchData = () => {
    setLoading(true)
    const url = admin ? `/applicants/progress` : `/applicants/progress/${id}`
    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setProgressData(data.progress);
        setLoading(false)
      })
      .catch((error: any) => {
        setLoading(false)
        console.error(error);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <Card>
      {loading && <Spinner />}
      <CardHeader
        title={title ||"Applicant Progress"}
        setOpenModal={setOpenModal}
        expanded={expanded}
        expandable={false}
        setExpanded={setExpanded}
        addIcon={admin}
        type={''}
        setType={() => { }}
      />
      <Modal open={openModal} closeHandler={handleCloseModal}>
        <ApplicantProgressModalContent closeMe={handleCloseModal} id={id} fetchData={fetchData} />
      </Modal>
      {progressData ?
        <div className='applicant-progress-container'>
          {progressData.map((val: any, idx: number) => {
            return (
              <ApplicantsCards
                admin={admin}
                editApplicant={() => { }}
                id={id}
                cardName={val.cardName}
                items={val.cardItems}
                fetchData={fetchData}
                idx={idx}
              />
            );
          })}
        </div> : <NoData />}
    </Card>
  );
};


