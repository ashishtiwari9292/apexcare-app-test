import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent, ArchiveModal } from 'components';
import { SectionProps } from 'typings';
import { formatName, formatDate, generateUrl, sort } from 'lib';
import { ClientsModalContent } from './ClientsModalContent';
import { useCompany } from 'hooks';
import parse from 'html-react-parser'
import { useFilter } from 'pages/Marketing/ReferralPartners/ReferralFilterContext';


export const Clients = ({ filter }: SectionProps): JSX.Element => {
  const { locations } = useCompany()
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [rows, setRows]: any[] = useState([]);
  const [archiveOpenModal, setArchiveOpenModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const { toggleUpdateComponent } = useFilter()

  const generateRows = (data: any) =>
    data.map((rowObj: any) => ({
      id: rowObj._id,
      status: { value: rowObj?.active ? 'Active' : 'Inactive', style: { width: '10%' } },
      location: { value: rowObj?.location.location, style: { width: '15%' } },
      name: {
        value: formatName(rowObj?.firstName, rowObj?.lastName),
        style: { width: '20%' },
      },
      careManager: {
        value: formatName(rowObj.careManager?.firstName, rowObj.careManager?.lastName),
        style: { width: '20%' },
      },
      comments: { value: parse(rowObj?.comments || ''), style: { width: '30%', whiteSpace: "pre-wrap" } },
      lastActivity: { value: formatDate(rowObj?.modifiedAt), style: { width: '15%' } },
      state: {
        value: {
          completedBy: rowObj.deactivateBy,
          completedAt: rowObj.deactivateDate,
          closingComments: rowObj.closingComments,
          comments: rowObj.comments,
          render: !rowObj.active,
          deactivateReason: rowObj?.deactivateReason
        },
        style: {},
      },
    }));

  const fetchData = useCallback(() => {
    toggleUpdateComponent()
    setLoading(true);
    const url = generateUrl('client', filter, '', '', locations);
    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setRows(generateRows(data));
        setLoading(false);
      })
      .catch((error: any) => {
        toast.error('Failed to load Clients.');
        console.error(error);
        setLoading(false);
      });
  }, [filter, locations]);

  useEffect(() => {
    fetchData();
  }, [filter, locations]);

  const handleCloseModal = () => {
    fetchData();
    setOpenModal(false);
  };

  const handleArchive = (row: any) => {
    setArchiveOpenModal(true);
    setSelectedRow(row);
  };

  const archiveHandleCloseModal = () => {
    fetchData();
    setArchiveOpenModal(false);
  };
  const handleReactivate = () => {
    fetchData();
  };
  const handleSort = (sortVal: string, type: string, ascending: boolean) => {
    setRows(sort(rows, sortVal, type, ascending, 'clients'));
  };

  return (
    <Card>
      <CardHeader title="Clients" setOpenModal={setOpenModal} expanded={expanded} setExpanded={setExpanded} />
      <Modal open={openModal} closeHandler={handleCloseModal} title="Add Client">
        <ClientsModalContent closeHandler={handleCloseModal} />
      </Modal>
      {loading && <Spinner />}
      {!loading && rows.length === 0 || locations.length === 0 && <NoData />}
      {!loading && rows.length > 0 && locations.length > 0 && (
        <CardContent expanded={expanded}>
          <ArchiveModal
            open={archiveOpenModal}
            closeHandler={archiveHandleCloseModal}
            collectionName="client"
            selected={selectedRow}
            label="Client"
            deactivate
          />
          <Table
            columns={['Status', 'Location', 'Name', 'Care Manager', 'Comments', 'Last Activity', '']}
            rows={rows}
            handleArchive={handleArchive}
            hideArchive={filter.status.value === 'Inactive'}
            handleReactivate={handleReactivate}
            type="list"
            handleSort={handleSort}
          />
        </CardContent>
      )}
    </Card>
  );
};
