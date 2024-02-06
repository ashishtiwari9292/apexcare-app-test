import { useEffect, useState, useCallback, useContext } from 'react';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent, ArchiveModal, ActionButtons } from 'components';
import { SectionProps } from 'typings';
import { careManagerSort, generateUrl, numberToMonth, sort } from 'lib';
import CareManagerActivitiesModalContent from 'views/CareManagerActivities/CareManagerActivitiesModalContent';
import { generateRows, generateDetailMarketingRows, generateProspectRows } from 'views/CareManagerActivities/generateRows';
import BatchAddActivitesModalContent from 'views/CareManagerActivities/BatchAddActivitiesModalContent';
import ActivityTemplateModalContent from 'views/CareManagerActivities/ActivityTemplateModalContent';
import { useCompany } from 'hooks'
import { Button } from '@mui/material';
import moment, { Moment } from 'moment';
import MarketingActivitiesModalContent from './MarketingActivitiesModalContent';
import { useParams } from 'react-router-dom';
import { DataContext } from 'views/Prospects/ProspectDetail';
import { PartnerContext } from 'pages/ReferralPartnerDetail/ReferralPartnerDetail';
import { MarketingManagementContext } from 'pages/Marketing/MarketingManagement';
import MarketingTasksModalContent from './MarketingTasksModalContent';


export function MarketingTasksTable({ renderPartners = true, renderType, filter, data, type, setActivities, detail, fetchCalendarData, inline = false, currentActivity, prospectId, openModal, setOpenModal, title, source }: any) {
    const { referralPartnerId } = useParams();
    const { locations } = useCompany()
    const [currentType, setType] = useState('All')
    const [loading, setLoading] = useState<boolean>(true);
    const [templates, setTemplates] = useState<any>([])
    const [openBatchModal, setOpenBatchModal] = useState<boolean>(false);
    const [openSelectionModal, setSelectionModal] = useState<boolean>(false)
    const [openTemplateModal, setTemplateModal] = useState<boolean>(false)
    const [expanded, setExpanded] = useState<boolean>(true);
    const [rows, setRows]: any[] = useState([]);
    const [archiveOpenModal, setArchiveOpenModal] = useState<boolean>(false);
    const [editOpenModal, setEditOpenModal] = useState<boolean>(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10)
    const [currentRow, setCurrentRow] = useState<any>({})
    const [confirmDelete, setConfirmDelete] = useState(false)
    const { shouldRefetch = [false, false], handleRefetchComplete } = useContext<any>(referralPartnerId ? PartnerContext : DataContext);
    const { shouldRefetchMarketing = [false], handleRefetchMarketingComplete } = useContext<any>(MarketingManagementContext);
    const [renderP, setRenderP] = useState(true)


    const formatFilterGroup = (filter: any) => {
        const grouping: any = filter?.groupBy?.value
        let result: any = ''

        if (grouping === 'None') {
            result = false
        } else if (grouping === 'Marketing Manager') {
            result = 'careManager'
        } else if (grouping === 'Company') {
            result = 'company'
        } else if (grouping === 'Referral Partner') {
            result = 'client'
        }
        else if (grouping === 'Activity Type') {
            result = 'activity'
        } else if (grouping === 'Month') {
            //add logic to group by month
            result = 'month'
        } else if (grouping === 'Day') {
            result = 'day'
        } else if (grouping === 'Week') {
            result = 'week'
        }
        else if (grouping === 'Prospect') {
            result = 'prospect'
        }



        return result
    }

    function formatDisplayedDate(dateString: any) {
        const dateParts = dateString.split('/');
        const year = dateParts[2];
        const monthIndex = parseInt(dateParts[0]) - 1;
        const day = parseInt(dateParts[1]);

        const monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

        const monthName = monthNames[monthIndex];
        return `${monthName} ${day}, ${year}`;
    }
    function getWeekKey(weekStart: Date, weekEnd: Date): string {
        const startMonth = monthNames[weekStart.getMonth()];
        const endMonth = monthNames[weekEnd.getMonth()];
        const startDate = weekStart.getDate();
        const endDate = weekEnd.getDate();
        const year = weekStart.getFullYear();
        return `${startMonth} ${startDate} - ${endMonth} ${endDate}, ${year}`;
    }

    const monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];


    function getWeekStartDate(date: Date): Date {
        const dayOffset = (date.getUTCDay() + 6) % 7;
        const weekStart = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - dayOffset);
        return weekStart;
    }

    function getWeekEndDate(date: Date): Date {
        const dayOffset = (date.getUTCDay() + 6) % 7;
        const weekEnd = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - dayOffset + 6);
        return weekEnd;
    }

    const multipleManagerRowFormat = (data: any, groupBy: string) => {
        let obj: any = {}
        let resultArr: any = []
        if (!groupBy) return data;

        if (data[0]?.data) return data
        data.map((item: any) => {
            let key = item[groupBy]?.value;
            if (groupBy === 'client') {
                if (item?.state?.value?.clientObj?.firstName) {
                    key = `${item?.state?.value?.clientObj?.firstName} ${item?.state?.value?.clientObj?.lastName}`
                }
            }
            if (groupBy === 'prospect') {
                key = item?.prospect?.state?.fullName || 'Not Found'

            }
            if (groupBy === 'company') {
                if (item?.state?.value?.carePartnerObj?.companyName) {
                    key = item?.state?.value?.carePartnerObj?.companyName
                }
            }
            if (!key || key.length === 0) {
                key = `Not Found`;  // or use some other placeholder
            }
            if (groupBy === 'week') {
                const date = new Date(item['dueDate']?.value);
                const weekStart = getWeekStartDate(date);
                const weekEnd = getWeekEndDate(date);
                key = getWeekKey(weekStart, weekEnd);
            } else if (groupBy === 'day') {

                key = formatDisplayedDate(item['dueDate']?.value)
            }
            if (!obj[key]) {
                obj[key] = []
            }

            obj[key].push(item)
        })
        for (const key in obj) {
            resultArr.push({ location: key, data: obj[key], count: obj[key]?.length })
        }
        return resultArr
    }

    const getISOString = (date: string | Moment) => {
        if (!moment.isMoment(date)) {
            return moment(date).endOf('day').toISOString();
        }
        return date.endOf('day').toISOString();
    };
    const formatRadioSelection = (selection: any) => {
        const selectionMap: any = {
            'Prospect': 'prospects-detail-log',
            'Referral Partner': 'referral-partner-detail-log'
        }
        return selectionMap[selection];
    }

    const fetchData = useCallback(() => {
        setLoading(true);
        setRows([]);
        let range: any = { startDate: '', endDate: '' };
        const { startDate, endDate, dateRange, } = filter;

        if (dateRange?.value === 'Custom' && startDate?.value && endDate?.value) {
            range = { startDate: getISOString(startDate.value), endDate: getISOString(endDate.value) };
        } else if (dateRange?.value && Number(dateRange?.id)) {
            if (dateRange?.id < 0) {
                const end = moment().add(Number(dateRange.id), 'd');
                range = { startDate: getISOString(end) };
            } else {
                const start = moment().add(Number(dateRange.id), 'd');
                range = { startDate: getISOString(start) };
            }
        }
        const url = `marketing/activities?&marketingManager=${filter?.marketingManager?.id}&referralPartner=${referralPartnerId || filter?.referralPartner?.id}&company=${filter?.company?.id}&location=${filter?.location?.id}&startDate=${range.startDate}&endDate=${range.endDate}&currentActivity=${currentActivity}&prospectId=${prospectId || filter?.prospect?.id}&source=${currentType !== 'All' ? formatRadioSelection(currentType) : source}`
        API.get(url)
            .then((rsp: any) => {
                const data = rsp.data.data;
                detail ? !renderPartners ? setRows(generateProspectRows(data)) : setRows(generateDetailMarketingRows(data, referralPartnerId, currentType)) : setRows(generateRows(data))
                setActivities && setActivities(data)
                setLoading(false);
            })
            .catch((error: any) => {
                toast.error('Failed to load Marketing Tasks.');
                console.error(error);
                setLoading(false);
            })
    }, [filter, locations, source, currentType]);


    const handleCloseModal = async () => {
        setOpenModal(false)
        fetchData()
    }
    useEffect(() => {
        fetchData();
        handleRefetchComplete && handleRefetchComplete(0)
    }, [filter, locations, prospectId, shouldRefetch[0], currentType]);


    useEffect(() => {
        fetchData();
        handleRefetchMarketingComplete && handleRefetchMarketingComplete(0)
    }, [shouldRefetchMarketing[0]]);

    const handleCloseSelectionModal = () => {
        setSelectionModal(false)
    }

    const handleCloseBatchModal = () => {
        fetchData();
        fetchCalendarData()
        setOpenBatchModal(false);
    };
    const handleCloseTemplateModal = () => {
        fetchData();
        fetchCalendarData()
        setTemplateModal(false);
    };
    const editHandleCloseModal = () => {
        fetchData();
        fetchCalendarData && fetchCalendarData()
        setEditOpenModal(false);
    };
    const handleEdit = (row: any) => {
        if (row?.state?.value?.referralPartners.length > 0) {
            setRenderP(true)
        } else {
            setRenderP(false)
        }
        setEditOpenModal(true);
        setSelectedRow(row);
        console.log('this is the row', row)
        const currentDate = moment().format("YYYY-MM-DD");

        // Combine the current date and the time
        const combinedDateTime = moment(`${currentDate} ${row?.time?.value}`, "YYYY-MM-DD hh:mma");

        // Convert it to a JavaScript Date object
        const jsDate = new Date(combinedDateTime.toISOString());

        console.log('this is the time',jsDate);


    };
    const handleArchive = (row: any) => {
        setArchiveOpenModal(true);
        setSelectedRow(row);
    };
    const archiveHandleCloseModal = () => {
        fetchData();
        fetchCalendarData()
        setArchiveOpenModal(false);
    };
    const handleReactivate = () => {
        fetchCalendarData()
        fetchData();
    };
    const deleteHandler = () => {
        const id = currentRow?.state?.currentRow?._id || currentRow?.id
        toast.loading('Deleting...');
        API.delete(`marketing/${id}`)
            .then((rsp => {
                toast.dismiss()
                if (rsp.data.success) {
                    toast.success('Successfully deleted.');
                    fetchData();
                    setConfirmDelete(false)
                }
            }))
            .catch((error) => {
                toast.dismiss();
                toast.error('Failed to delete.');
                fetchData();
                setConfirmDelete(false)
                console.error(error);
            });
    }

    const handleRemove = (row: any) => {
        setCurrentRow(row)
        setConfirmDelete(true)
    }
    const handleSort = (sortVal: string, type: string, ascending: boolean) => {
        setRows(careManagerSort(rows, sortVal, type, ascending, 'marketingManagment', filter?.careManager?.value === 'All' || filter?.careManager?.value === '', filter.groupBy))
    };

    const rowSelector = () => {
        if (currentType === 'Prospect') {
            return [
                { val: 'Flag', width: '5px' },
                { val: 'Due Date', width: '5%' },
                { val: 'Prospect', width: '20px' },
                { val: 'Due Time', width: '10px' },
                { val: 'Assigned To', width: '50px' },
                { val: 'Activity', width: '40%' },
                ,
                ''
            ]
        } else if (currentType === 'Referral Partner') {
            return [
                { val: 'Flag', width: '5px' },
                { val: 'Due Date', width: '5%' },
                { val: 'Referral Partner', width: '20px' },
                { val: 'Company', width: '20px' },
                { val: 'Due Time', width: '10px' },
                { val: 'Assigned To', width: '50px' },
                { val: 'Activity', width: '40%' },
                ,
                ''
            ]
        } else {
            return [
                { val: 'Flag', width: '5px' },
                { val: 'Due Date', width: '5%' },
                { val: 'Referral Partner', width: '20px' },
                { val: 'Prospect', width: '20px' },
                { val: 'Company', width: '20px' },
                { val: 'Due Time', width: '10px' },
                { val: 'Assigned To', width: '50px' },
                { val: 'Activity', width: '40%' },
                ,
                ''
            ]
        }
    }

    useEffect(() => {
        API.get('activity-template/new hire')
            .then(rsp => {
                setTemplates(rsp.data.data)
            })
            .catch(err => {
                console.log(err)
            })
    }, [])

    return (
        <Card>
            {!inline && (<CardHeader
                title="Marketing Tasks"
                setOpenModal={setSelectionModal}
                expanded={expanded}
                setExpanded={setExpanded}
                radioGroup={true}
                radioGroupLabel1="Referral Partner"
                radioGroupLabel2='Prospect'
                type={currentType}
                setType={setType}
                renderAll
            />)}
            <Modal open={openModal} closeHandler={() => setOpenModal(false)} title={`Add Task`}>
                < MarketingActivitiesModalContent activityType={source === 'referral-partner-detail' ? 'Referral Partner' : 'Prospect'} source={source} closeHandler={handleCloseModal} renderButtons={true} renderType={renderType} renderPartners={renderPartners} />
            </Modal>
            <Modal open={openSelectionModal} closeHandler={handleCloseBatchModal} title=" Add Marketing Task Template">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px', width: '80%' }}>
                    <Button variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} onClick={() => setOpenBatchModal(true)}>Add Tasks</Button>
                    <Button variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} onClick={() => setTemplateModal(true)}>Apply Template</Button>
                </div>
                <ActionButtons renderEmail={false} closeHandler={() => setSelectionModal(false)} renderSubmit={false} />
            </Modal >
            <Modal open={openBatchModal} closeHandler={handleCloseBatchModal} title="Batch Add Task">
                <BatchAddActivitesModalContent closeHandler={handleCloseBatchModal} closeSelectionModal={handleCloseSelectionModal} showType={type} data={data} management={true} />
            </Modal>
            <Modal open={openTemplateModal} closeHandler={handleCloseTemplateModal} title="Apply Task Template">
                <ActivityTemplateModalContent closeHandler={handleCloseTemplateModal} closeSelectionModal={handleCloseSelectionModal} showType={type} data={data} management={true} />

            </Modal>
            <Modal
                open={confirmDelete}
                closeHandler={() => setConfirmDelete(false)}
                title='Confirm Delete'
                styles={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '20%',
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <div>
                    <Button
                        type='submit'
                        variant="contained"
                        sx={{ mt: 1, mr: 1, backgroundColor: 'red' }}
                        onClick={deleteHandler}
                    >
                        Delete
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setConfirmDelete(false)}
                        sx={{ mt: 1, mr: 1 }}
                    >
                        Cancel
                    </Button>
                </div>
            </Modal>
            {loading && <Spinner />}
            {!loading && (rows.length === 0 || locations.length === 0) ? <NoData /> :
                !loading && rows.length > 0 && locations.length > 0 && !inline ? (
                    <CardContent expanded={expanded}>
                        <Modal currentRow={selectedRow} open={editOpenModal} closeHandler={editHandleCloseModal} title="Edit Marketing Task" radioGroup={true} radioGroupLabel1="Completed" radioGroupLabel2='Incomplete'>
                            <MarketingTasksModalContent renderPartners={renderP} closeHandler={editHandleCloseModal} renderButtons={true} showType={"batchAdd"} data={data} selected={selectedRow} currentRow={selectedRow} />
                        </Modal>
                        <ArchiveModal
                            open={archiveOpenModal}
                            closeHandler={archiveHandleCloseModal}
                            collectionName="care-manager-activity-event"
                            selected={selectedRow}
                            label="Care Manager Tasks"
                        />
                        <Table
                            columns={detail ? rowSelector() : [
                                { val: 'Flag', width: '5px' },
                                { val: 'Status', width: '10px' },
                                { val: 'Created Date', width: '5%' },
                                { val: 'Due Date', width: '5%' },
                                { val: 'Time', width: '10px' },
                                { val: 'Location', width: '20px' },
                                { val: 'Client', width: '20px' },
                                { val: 'Care Manager', width: '50px' },
                                { val: 'Care Partner', width: '50px' },
                                { val: 'Activity', width: '40%' },
                                , '']}
                            tableName="marketingManagement"
                            rows={filter.groupBy.value !== 'None' ? multipleManagerRowFormat(rows, formatFilterGroup(filter)) : rows}
                            handleArchive={handleArchive}
                            handleEdit={handleEdit}
                            hideArchive={true}
                            handleSort={handleSort}
                            handleReactivate={handleReactivate}
                            type={filter.groupBy.value !== 'None' ? 'care-manager-activities' : ''}
                            pageChangeHandler={(page: any) => setPage(page)}
                            currentRow={limit}
                            setCurrentRow={(limit: any) => setLimit(limit)}
                            handleRemove={handleRemove}
                        />
                    </CardContent>
                ) :
                    <>
                        <Modal source={source} currentRow={selectedRow} open={editOpenModal} closeHandler={editHandleCloseModal} title={`Edit Task`} radioGroup={true} radioGroupLabel1="Completed" radioGroupLabel2='Incomplete'>
                            <MarketingTasksModalContent renderPartners={renderP} closeHandler={editHandleCloseModal} renderButtons={true} showType={"batchAdd"} data={data} selected={selectedRow} currentRow={selectedRow} />
                        </Modal>
                        <Table
                            columns={detail ? !renderPartners ? [
                                { val: 'Flag', width: '5px' },
                                { val: 'Created Date', width: '5%' },
                                { val: 'Due Date', width: '5%' },
                                { val: 'Time', width: '10px' },
                                { val: 'Created By', width: '50px' },
                                { val: 'Activity', width: '40%' },

                                ''

                            ] : [
                                { val: 'Flag', width: '5px' },
                                { val: 'Created Date', width: '5%' },
                                { val: 'Due Date', width: '5%' },
                                { val: 'Time', width: '10px' },
                                { val: 'Created By', width: '50px' },
                                { val: 'Activity', width: '40%' },


                                ''
                            ] : [
                                { val: 'Flag', width: '5px' },
                                { val: 'Status', width: '10px' },
                                { val: 'Due Date', width: '5%' },
                                { val: 'Time', width: '10px' },
                                { val: 'Location', width: '20px' },
                                { val: 'Client', width: '20px' },
                                { val: 'Care Manager', width: '50px' },
                                { val: 'Care Partner', width: '50px' },
                                { val: 'Activity', width: '40%' },
                                '']}
                            tableName="marketingManagement"
                            rows={filter.groupBy.value !== 'None' ? multipleManagerRowFormat(rows, formatFilterGroup(filter)) : rows}
                            handleArchive={handleArchive}
                            handleEdit={handleEdit}
                            hideArchive={filter?.status && filter?.status?.value === 'Closed'}
                            handleSort={handleSort}
                            handleReactivate={handleReactivate}
                            type={filter.groupBy.value !== 'None' ? 'care-manager-activities' : ''}
                            pageChangeHandler={(page: any) => setPage(page)}
                            currentRow={limit}
                            setCurrentRow={(limit: any) => setLimit(limit)}
                            handleRemove={handleRemove}
                        /></>}
        </Card>
    );
}

