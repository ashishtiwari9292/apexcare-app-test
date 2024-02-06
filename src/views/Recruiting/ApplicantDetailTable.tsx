import { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { Card } from 'components';
import { useParams } from 'react-router-dom';
import { fetchSources, formatDate, fetchStages } from 'lib';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import ApplicantsModalContent from './ApplicantsModalContent';
import parse from 'html-react-parser'

export const ApplicantDetailTable = ({ applicantData }: any) => {
  const [rows, setRows]: any[] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editOpenModal, setEditOpenModal] = useState(false);
  const userId = useParams();
  const { id } = userId;
  const [stages, setStages] = useState([])
  const [sources, setSources] = useState([])

  const formatRows = (rowsObj: any) => {
    return rowsObj.map((row: any) => ({
      name: { value: row.fullName, style: { width: '8%' } },
      flag: { value: row.flag, style: { width: '5%' } },
      location: { value: row.location.location, style: { width: '8%' } },
      phone: { value: row.phone, style: { width: '10%' } },
      email: { value: row.email, style: { maxWidth: '5%', textOverflow: 'ellipsis' } },
      source: { value: row.source.source, style: { width: '5%' } },
      status: row.active ? 'Active' : 'Inactive',
      stage: { value: row.stage.stage, style: { width: '5%' } },
      activeDate: { value: row.activeDate ? formatDate(row.activeDate) : '', style: { width: '10%' } },
      comments: { value: row.comments, style: { width: '50%' } },
      state: { id, location: row.location.location, source: row.source, hireDate: row.hireDate ? formatDate(row.hireDate) : '', inactiveDate: row.inactiveDate ? formatDate(row.inactiveDate) : '', firstName: row.firstName, lastName: row.lastName, frontEnd:row?.frontEnd, comments:row?.comments }
    }));
  };

  useEffect(() => {
    fetchStages(setStages)
    fetchSources(setSources)
  }, [])

  const fetchData = useCallback(() => {
    setLoading(true)
    API.get(`applicants/applicant/${id}`)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setRows(formatRows([data]))
        setLoading(false)
      })
      .catch((error: any) => {
        toast.error('Failed to load Activity types.');
        console.error(error);
        setLoading(false)
      });
  }, []);

  const editHandleCloseModel = () => {
    fetchData();
    setEditOpenModal(false);
  };

  useEffect(() => {
    fetchData();
  }, [applicantData]);

  return (
    <>
      <Box sx={{ boxShadow: 0, pt: 18 }}>
      </Box>
      <Card>
        <ApplicantsModalContent detail closeMe={editHandleCloseModel} currentRow={rows[0]} options={{ stages, sources }} />
      </Card>
    </>
  );
};
