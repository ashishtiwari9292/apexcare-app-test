import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent, ArchiveModal } from 'components';
import { SectionProps } from 'typings';
import { useAuth, useCompany } from 'hooks';
import CurrentNotesModalContent from './CurrentNotesModalContent';
import { generateUrl } from 'lib';
import parse from 'html-react-parser';


export function CurrentNotes({ filter }: SectionProps): JSX.Element {
  const { locations } = useCompany()
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [rows, setRows]: any[] = useState([]);
  const [archiveOpenModal, setArchiveOpenModal] = useState<boolean>(false);
  const [editOpenModal, setEditOpenModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const generateRows = (data: any) =>
    data.map((rowObj: any) => ({
      id: rowObj._id,
      location: { value: rowObj.location.location, style: { width: '10%' } },
      notes: { value: parse(rowObj?.notes), style: { width: '70%', whiteSpace: "pre-wrap" } },
      state: {
        value: {
          completedBy: rowObj.completedBy,
          completedAt: rowObj.completedAt,
          closingComments: rowObj.closingComments,
          render: !rowObj.active,
          location:rowObj.location,
          notes:rowObj.notes,
        },
      },
    }));

  const fetchData = useCallback(() => {
    setLoading(true);
    setRows([]);
    const url = generateUrl('current-notes', filter, user ? user._id.toString() : '', '', locations);
    API.get(url)
      .then((rsp: any) => {
        const notes = rsp.data.data;
        setRows(generateRows(notes));
        setLoading(false);
      })
      .catch((error: any) => {
        toast.error('Failed to load current notes.');
        console.error(error);
        setLoading(false);
      });
  }, [filter,locations]);

  useEffect(() => {
    fetchData();
  }, [filter,locations]);
 

  const handleCloseModal = () => {
    fetchData();
    setOpenModal(false);
  };

  const editHandleCloseModal = () => {
    fetchData();
    setEditOpenModal(false);
  };

  const handleEdit = (row: any) => {
    setEditOpenModal(true);
    setSelectedRow(row);
  };

  const handleArchive = (row: any) => {
    setArchiveOpenModal(true);
    setSelectedRow(row);
  };

  const archiveHandleCloseModal = () => {
    fetchData();
    setArchiveOpenModal(false);
  };

  return (
    <Card>
      <CardHeader title="Current Notes" setOpenModal={setOpenModal} expanded={expanded} setExpanded={setExpanded}  />
      <Modal open={openModal} closeHandler={handleCloseModal} title="Add Current Notes">
        <CurrentNotesModalContent closeHandler={handleCloseModal} />
      </Modal>
      {loading && <Spinner />}
    {!loading && (rows.length === 0 || locations.length === 0) && <NoData />}
      {!loading && rows.length > 0 && locations.length > 0 &&(
        <CardContent expanded={expanded}>
          <Modal open={editOpenModal} closeHandler={editHandleCloseModal} title="Edit Current Notes">
            <CurrentNotesModalContent closeHandler={editHandleCloseModal} selected={selectedRow} />
          </Modal>
          <ArchiveModal
            open={archiveOpenModal}
            closeHandler={archiveHandleCloseModal}
            collectionName="current-notes"
            selected={selectedRow}
            label="Current Notes"
          />
          <Table
            columns={['Location', 'Notes',"",]}
            rows={rows}
            handleArchive={handleArchive}
            handleEdit={handleEdit}
            hideArchive={true}
            tableName='current-notes'
            type = 'current-notes'
          />
        </CardContent>
      )}
    </Card>
  );
}
