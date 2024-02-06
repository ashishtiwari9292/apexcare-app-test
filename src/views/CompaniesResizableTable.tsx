import React, { useState, useEffect, useCallback, Fragment } from 'react';
import Paper from '@mui/material/Paper';
import {
  PagingState,
  IntegratedPaging,
  SortingState,
  IntegratedSorting,
} from '@devexpress/dx-react-grid';
import _ from 'lodash'
import { GrFlagFill } from 'react-icons/gr';
import {
  Grid,
  Table,
  TableHeaderRow,
  TableColumnResizing,
  PagingPanel,
} from '@devexpress/dx-react-grid-material-ui';
import { IconButton, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { toast } from 'react-toastify';
import { Modal } from 'components';
import API from 'services/AxiosConfig';
import { formatCMDate, } from 'lib';
import EditIcon from '@mui/icons-material/Edit';
import ModalTabs from './ModalTabs';
import { useAuth } from 'hooks';
import { CSVLink } from "react-csv";
import CompaniesModalContent from './ReferralPartners/CompaniesModalContent';
import CollapsibleList from 'components/Table/CollapsibleList';
import { useFilter } from 'pages/Marketing/ReferralPartners/ReferralFilterContext';
interface Contact {
  _id: string;
  flagged: boolean;
  firstName: string;
  lastName: string;
  location: {
    _id: string;
    location: string;
    __v: number;
    status: boolean;
  };
  companyName: {
    _id: string;
    flag: boolean;
    companyName: string;
    companyType: string;
    location: string; // Updated to string type
    phoneNumber: string;
    email: null | string;
    address1: string;
    address2: null | string;
    city: string;
    state: string;
    zipCode: string;
    status: boolean;
    activeDate: null | string;
    inactiveDate: null | string;
    comments: string;
    createdAt: string;
    createdBy: string;
    modifiedAt: string;
    modifiedBy: string;
    website: null | string;
    accountOwner: string;
    __v: number;
  };
  accountOwner: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    roles: string[];
    location: string;
    email: string;
    emailVerified: boolean;
    modifiedAt: string;
    dataStatus: string;
    createdAt: string;
    __v: number;
  };
  title: string;
  mobilePhone: null | string;
  officePhone: string;
  primaryEmail: string;
  secondaryEmail: null | string;
  status: boolean;
  activeDate: string;
  inactiveDate: null | string;
  address1: string;
  city: string;
  state: string;
  zipcode: string;
  referralType: null | string;
  comments: string;
  createdAt: string;
  createdBy: null | string;
  modifiedAt: null | string;
  modifiedBy: null | string;
  __v: number;
}


interface TableColumnWidthInfo {
  columnName: string;
  width: number | string;
}

interface Column {
  name: string;
  title: string;
}

interface Row {
  [key: string]: any;
}



const CompaniesResizableTable: any = ({ filter, addOpenModal, setAddOpenModal }: any) => {
  const { user } = useAuth()
  const [columns, setColumns] = useState<any>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [openModal, setOpenModal] = useState(false)
  const [columnWidths, setColumnWidths] = useState<TableColumnWidthInfo[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState<any>(25);
  const [pageSizes] = useState<any>([5, 10, 25, 50]);
  const [sorting, setSorting] = useState<any>([]);
  const [configId, setConfigId] = useState<any>(null)
  const [csvData, setCsvData] = useState([])
  const [csvHeaders, setCsvHeaders] = useState([])
  const [groupedRows, setGroupedRows] = useState<any>([])
  const [title, setTitle] = useState('')
  const [defaultColumns, setDefaultColumns] = useState([{ name: 'flag', title: 'Flag' },
  { name: 'companyName', title: 'Company Name' },
  { name: 'companyType', title: 'Company Type' },
  { name: 'location', title: 'Location' },
  { name: 'phoneNumber', title: 'Phone Number' },
  { name: 'address1', title: 'Address 1' },
  { name: 'address2', title: 'Address 2' },
  { name: 'city', title: 'City' },
  { name: 'state', title: 'State' },
  { name: 'zipCode', title: 'Zip Code' },
  { name: 'status', title: 'Status' },
  { name: 'activeDate', title: 'Active Date' },
  { name: 'inactiveDate', title: 'Inactive Date' },
  { name: 'comments', title: 'Comments' },
  { name: 'createdAt', title: 'Created At' },
  { name: 'website', title: 'Website' },])
  const {toggleUpdateComponent} = useFilter()

  const TableCell = ({ column, value, ...restProps }: any) => (
    <Table.Cell {...restProps} style={column.name === '_id' ? { display: 'flex', justifyContent: 'flex-end', } : {}}>
      {(column.name === 'flag' && value) ? <GrFlagFill color="red" /> : (column.name === '_id') ? <NavLink to={`/marketing/company/${value}`}><IconButton
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
        }}
        aria-label="Edit Item "
      >
        <AccountCircleIcon />
      </IconButton></NavLink> : value}

    </Table.Cell>
  );

  const TableHeaderCell = ({ column, ...restProps }: any) => (
    <TableHeaderRow.Cell {...restProps}>
      {column.name !== '_id' ? (
        <Fragment>
          {restProps.children}
        </Fragment>
      ) : (
        <></>
      )}
    </TableHeaderRow.Cell>
  );

  const handleChange = useCallback((data: any) => {
    setOpenModal(false)
  }, []);

  const TableRow = ({ row, ...restProps }: any) => (
    // Access the row data here and customize your row
    <Table.Row {...restProps}
    >
    </Table.Row>
  );

  const fetchColumns = () => {
    API.get(`/company-config/${user._id}`)
      .then(rsp => {
        setColumnWidths([])
        setTitle(rsp?.data[0]?.name)

        setColumns([...rsp?.data[0]?.columns, { name: '_id', title: '_id' }])
        setColumnWidths([...rsp?.data[0]?.columns, { name: '_id', title: '_id' }].map((item: any) => {
          return { columnName: item?.name, width: item?.width || 100 };
        }));
        setConfigId(rsp.data[0]._id)
        fetchData(filter, [...rsp.data[0].columns, { name: '_id', title: '_id' }])
      })
  }

  const handleColumnWidthsChange = (newColumnWidths: any) => {
    let copy = columnWidths.slice()

    setColumnWidths(newColumnWidths);

    // Find the column that has changed
    newColumnWidths.forEach((newColumn: any, index: any) => {
      const previousColumn = copy[index];
      if (previousColumn && previousColumn.width !== newColumn.width) {
        API.put('/company-config/configs/columns/width', {
          configId: configId,
          columnName: newColumn.columnName,
          newWidth: newColumn.width
        })
          .catch(error => console.error(error));
      }
    });

  }

  function groupBy(data: any, key: any, contacts: any) {
    const groupedData: any = {};

    data.forEach((entry: any, idx: any) => {
      let groupValue = entry[key] || contacts[idx][key] || undefined;
      if (!groupedData[groupValue]) {
        groupedData[groupValue] = {
          label: groupValue,
          rows: []
        };
      }

      groupedData[groupValue].rows.push(entry);
    });

    return Object.values(groupedData).sort((a: any, b: any) => a?.label - b?.label);
  }

  const generateRows = (contacts: Contact[], columns: string[], filter: any): Row[] => {
    const data: Row[] = [];
    contacts.forEach((contact: any) => {
      const row: any = {};
      columns.forEach((column: any) => {
        const value: any = _.get(contact, column.name);
        row[column.name] = value;
        if (column.title === 'Location') {
          row[column.name] = contact?.location.location;
        } else if (column.title === 'Company Type') {
          row[column.name] = contact?.companyType?.companyType
        } else if (column.title === 'Status') {
          row[column.name] = contact?.status === true ? 'Active' : 'Inactive'
        }
      });
      if (Object.values(row)?.length < 1) {
        return
      }
      data.push(row);
    });

    const groupBySelectionMapping: any = {
      'City': 'city',
      'Company Type': 'companyType',
      'None': 'None'
    }
    setGroupedRows(groupBy(data, groupBySelectionMapping[filter?.groupBy?.id], contacts))
    return data;
  };

  useEffect(() => {
    columns && fetchData(filter, columns)
    if (columns) {
      setCsvHeaders(columns.map((column: any) => ({
        label: column.title,
        key: column.name,
      })))
    }

  }, [filter, columns])

  useEffect(() => {
    fetchColumns()
  }, [])
  useEffect(() => {
    const csData: any = rows.map((row: Row) => {
      const newRow: any = {};
      for (const column of columns) {
        newRow[column.name] = row[column.name];
      }
      return newRow;
    });
    setCsvData(csData)
  }, [rows])


  const fetchData = (filter: any, columns: any) => {
    toggleUpdateComponent()
    const url = `referral-partners/companies/listing?status=${filter?.status?.value}&location=${filter?.location?.value || filter?.location?.id}&company=${filter?.companyName?.id}&referralPartner=${filter?.referralPartner?.id}&flag=${filter?.flag}&companyType=${filter?.companyType?.id}`
    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setRows(generateRows(data, [...columns], filter))

      })
      .catch((error: any) => {
        toast.error('Failed to get Referral Partners.');
        console.error(error);
      });
  };

  const handleClose = () => {
    fetchColumns()
    setAddOpenModal(false)
  }


  return (
    <>
      <Modal open={addOpenModal} closeHandler={handleClose} >
        <CompaniesModalContent closeMe={handleClose} />
      </Modal>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h4>{title}</h4>
          <IconButton
            color="primary"
            aria-label="edit configuration"
            component="span"
            onClick={() => setOpenModal(true)}
            style={{ marginTop: '-5px' }}
          >
            <EditIcon />
          </IconButton>
        </div>
        <Button variant="contained">
          <CSVLink
            data={csvData}
            headers={csvHeaders}
            filename={"data.csv"}
            style={{ color: 'white' }}
          >
            Download CSV
          </CSVLink>
        </Button>
      </div>
      <CollapsibleList
        tableProps={{
          columns: columns,
          sorting: sorting,
          setSorting: setSorting,
          currentPage: currentPage,
          setCurrentPage: setCurrentPage,
          pageSize: pageSize === 'All' ? rows.length : pageSize,
          setPageSize: setPageSize,
          columnWidths: columnWidths,
          handleColumnWidthsChange: handleColumnWidthsChange,
          pageSizes: pageSizes
        }}
        renderCompanyUrl={true}
        data={groupedRows}
      />
      <Modal open={openModal}>
        <div style={{ minHeight: '525px' }}>
          <ModalTabs
            callback={handleChange}
            url='company-config'
            options={defaultColumns}
            closeHandler={() => {
              fetchColumns()
              setOpenModal(false)
            }}
          />
        </div>
      </Modal>
    </>
  );
};

export default CompaniesResizableTable;





