import { useEffect, useState, useCallback } from 'react';
import API from 'services/AxiosConfig';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent, ArchiveModal } from 'components';
import { sort } from 'lib';
import { formatPermissions } from './formatPermissions';
import { formatUsers } from './formatUsers'
import UserManagementModalContent from './UserManagementModalContent';

export function UserManagementTable({ filter, data, type }: any) {
  const [loading, setLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [rows, setRows]: any[] = useState([]);
  const [archiveOpenModal, setArchiveOpenModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>({});
  const [editModal, setEditModal] = useState<boolean>(false)



  const fetchUsers = ()=>{
 
    API.get(`user/${filter.status.value}?location=${filter.location.id}`)
    .then(rsp =>{
    setRows(formatUsers(rsp.data.data))
    })
  }
  useEffect(() => {
    console.log(filter)
    fetchUsers()
  },[filter]);

  const handleCloseModal = () => {
    fetchUsers();
    setOpenModal(false);
  };

  const handleArchive = (row: any) => {
    setArchiveOpenModal(true);
    setSelectedRow(row);
  };
  const handleEdit = (row:any) => {
    setEditModal(true)
    setSelectedRow(row);
  }
  const handleReactivate = () => {
    fetchUsers();
  };
  const archiveHandleCloseModal = () => {
    setArchiveOpenModal(false);
  };
  const handleCloseEditModal = () => {
    fetchUsers();
    setEditModal(false)
  }
  const handleSort = (sortVal: string, type: string, ascending: boolean) => {
    setRows(sort(rows, sortVal, type, ascending, 'sensitiveIssues'));
  };

  return (
    // <Card>
    //   <CardHeader title="User Management" setOpenModal={setOpenModal} expanded={expanded} setExpanded={setExpanded} />
    //   <Modal open={openModal} closeHandler={handleCloseModal} title="Add Permission">
    //     <UserManagementModalContent closeHandler={handleCloseModal} showType={type} data={data} />
    //   </Modal>
    //   {loading && <Spinner />}
    //   {!loading && rows.length === 0 && <NoData />}
    //   {!loading && rows.length > 0 && (
    //     <CardContent expanded={expanded}>
    //       <ArchiveModal
    //         open={archiveOpenModal}
    //         closeHandler={archiveHandleCloseModal}
    //         collectionName="user-management"
    //         selected={selectedRow}
    //         label="Permission"
    //         fetchData = {fetchData}
    //       />
    //       <div style={{}}>
    //         <Table
    //           columns={[
    //             'namne',
    //             '',
    //             '',
    //           ]}
    //           rows={rows}
    //           handleArchive={handleArchive}
    //           handleReactivate={handleReactivate}
    //           handleEdit={() => { }}
    //           tableName="sensitive-issue"
    //           handleSort={handleSort}
    //           type={type}
    //           fetchData = {fetchData}
    //         />
    //       </div>
    //     </CardContent>
    //   )}
    // </Card>
      <Card>
      <CardHeader title="User Management" setOpenModal={setOpenModal} expanded={expanded} setExpanded={setExpanded} />
      <Modal open={openModal} closeHandler={handleCloseModal} title="Add User">
        <UserManagementModalContent closeHandler={handleCloseModal} showType={type} data={data} />
      </Modal>
      <Modal open={editModal} closeHandler={handleCloseEditModal} title="Edit User" >
        <UserManagementModalContent closeHandler={handleCloseEditModal} showType={type} data={data} selected = {selectedRow} />
      </Modal>
      {loading && <Spinner />}
      {!loading && rows.length === 0 && <NoData />}
      {!loading && rows.length > 0 && (
        <CardContent expanded={expanded}>
          <ArchiveModal
            open={archiveOpenModal}
            closeHandler={archiveHandleCloseModal}
            collectionName="user"
            selected={selectedRow}
            label="User"
            fetchData = {fetchUsers}
          />
          <div style={{}}>
            <Table
              columns={[
                'Status',
                'Name',
                'Location',
                'Phone',
                'Email',
                'Start Date',
                ,"",
              ]}
              rows={rows}
              handleArchive={handleArchive}
              handleReactivate={handleReactivate}
              handleEdit={handleEdit}
              tableName="sensitive-issue"
              handleSort={handleSort}
              type={'sensitive-issues'}
              fetchData = {fetchUsers}
              hideArchive={filter.status && filter.status.value === 'Inactive'}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
