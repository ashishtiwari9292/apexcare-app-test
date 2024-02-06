import { useState, useEffect } from 'react';
import { Layout } from 'components';
import { ApplicantActivityContainer, ApplicantProgress } from 'views';
import { useParams } from 'react-router-dom';
import { ApplicantDetailTable } from 'views/Recruiting/ApplicantDetailTable';
import { fetchActivities,fetchApplicantName } from 'lib';

export const ApplicantDetails = () => {
  const applicantId = useParams();
  const { id } = applicantId;
  const [applicantData, setApplicantData] = useState<any[]>([]);
  const [applicantName, setApplicantName] = useState<string>('');
  
  useEffect(() => {
    fetchActivities('Tasks',id,setApplicantData);
    id && fetchApplicantName(id,setApplicantName);
  }, []);

  return (
    <Layout>
      <ApplicantDetailTable applicantName={applicantName} />
      <ApplicantActivityContainer
        applicantName={applicantName}
        fetchActivities={fetchActivities}
        applicantData={applicantData}
        applicantId={id}
        setApplicantData={setApplicantData}
        tabs = {['All Tasks & Notes', 'Tasks', 'Internal Note']}
        title = 'Applicant Tasks & Notes'
        defaultTab= 'All Tasks & Notes'
      />
        <ApplicantActivityContainer
        applicantName={applicantName}
        fetchActivities={fetchActivities}
        applicantData={applicantData}
        applicantId={id}
        setApplicantData={setApplicantData}
        tabs = {['All Activities', 'Email', 'Calls / Texts', 'Interview - Phone', 'Interview - In Person']}
        title = 'Applicant Activity'
        defaultTab = 'All Activities'
      />
      <ApplicantProgress admin ={false} />
    </Layout>
  );
};
