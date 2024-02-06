import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { Card, CardHeader, Modal, Spinner, NoData, Table, ActionButtons } from 'components';
import API from 'services/AxiosConfig';
import { formatCMDate, sort, formatName, numberToMonth, formatDateTime } from 'lib';
import { GrFlagFill } from 'react-icons/gr';
import moment, { Moment } from 'moment';
import MarketingActivitiesModalContent from './MarketingActivitiesModalContent';
import { Link, useParams } from 'react-router-dom';
import { DataContext } from 'views/Prospects/ProspectDetail';
import { PartnerContext } from 'pages/ReferralPartnerDetail/ReferralPartnerDetail';
import { Button } from '@mui/material';
import MarketingDailyLogModalContent from './MarketingDailyLogModalContent';

function MarketingActivititesTable({ source, renderPartners, title, filter, inline, currentActivity,  setOpenModal, openModal, defaultSelection, defaultType = 'Referral Partner' }: any) {
    const [confirmDelete, setConfirmDelete] = useState(false)
    const { referralPartnerId, prospectId } = useParams()
    const [loading, setLoading] = useState(false)
    const [rows, setRows] = useState<any>([])
    const [type, setType] = useState(defaultType)
    const [openEditModal, setOpenEditModal] = useState(false)
    const [archiveOpenModal, setArchiveOpenModal] = useState(false)
    const [expanded, setExpanded] = useState(true)
    const [currentRow, setCurrentRow] = useState<any>({})
    const { shouldRefetch = [false, false], handleRefetchComplete } = useContext<any>(referralPartnerId ? PartnerContext : DataContext);
    const [renderButtons,setRenderButtons] = useState(true)
    const [activityType,setActivityType] = useState('Referral Partner')
    const [renderP,setRenderP] = useState(true)
  

    const handleCloseModal = () => {
        setOpenModal(false)
        fetchActivities()
        setRenderButtons(true)
    }
    const handleCloseEditModal = () => {
        setOpenEditModal(false)
        fetchActivities()
    }

    const handleEditModal = (row: any) => {
        console.log('its the row',row)
        if(row?.referralPartner){
            setRenderP(true)
        }else{
            setRenderP(false)
        }
        setOpenEditModal(true);
        setCurrentRow(row);
    }
    const getISOString = (date: string | Moment) => {
        if (!moment.isMoment(date)) {
            return moment(date).endOf('day').toISOString();
        }
        return date.endOf('day').toISOString();
    };

    const fetchActivities = async () => {
        let range: any = { startDate: '', endDate: '' };
        const { startDate, endDate, dateRange, activity } = filter;

        if (dateRange?.value === 'Custom' && startDate?.value && endDate?.value) {
            range = { startDate: getISOString(startDate.value), endDate: getISOString(endDate.value) };
        } else if (dateRange?.value && Number(dateRange?.id)) {
            if (dateRange?.id < 0) {
                const end = moment().subtract(Number(dateRange.id), 'd');
                range = { startDate: getISOString(moment()), endDate: getISOString(end) };
            } else if (filter?.awardType) {
                const start = moment().subtract(Number(dateRange.id), 'month');
                range = { startDate: getISOString(start), endDate: getISOString(moment()) };
            } else {
                const start = moment().subtract(Number(dateRange.id), 'd');
                range = { startDate: getISOString(start), endDate: getISOString(moment()) };
            }
        }
        const activities = await API.get(`/marketing/activities?activity=${filter?.activity?.id || ''}&marketingManager=${filter.marketingManager.id}&referralPartner=${referralPartnerId || filter.referralPartner.id}&company=${filter.company.id}&location=${filter.location.id}&startDate=${range.startDate}&endDate=${range.endDate}&completed=${true}&currentActivity=${currentActivity}&prospectId=${prospectId}&source=${type !== 'All' ? formatRadioSelection(type) : source}&sortDirection=${-1}`)
        setRows(generateRows(activities.data.data))
    }

    const formatFilterGroup = (filter: any) => {
        const grouping: any = filter?.groupBy?.value
        let result: any = ''
        if (grouping === 'None') {
            result = false
        } else if (grouping === 'Location') {
            result = 'location'
        } else if (grouping === 'Day') {
            result = 'date'
        } else if (grouping === 'Activity Type') {
            result = 'activity'
        } else if (grouping === 'Month') {
            //add logic to group by month
            result = 'month'
        } else if (grouping === 'Created By') {
            result = 'marketingManager'
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

    const archiveHandleCloseModal = () => {
        fetchActivities();
        setArchiveOpenModal(false);
    };

    const handleArchive = (row: any) => {
        setArchiveOpenModal(true);
        setCurrentRow(row);
    };
    const handleRemove = (row: any) => {
        setCurrentRow(row)
        setConfirmDelete(true)
    }

    const deleteHandler = () => {
        const id = currentRow?.state?.currentRow?._id || currentRow?.id
        toast.loading('Deleting...');
        API.delete(`marketing/${id}`)
            .then((rsp => {
                toast.dismiss()
                if (rsp.data.success) {
                    toast.success('Successfully deleted.');
                    fetchActivities()
                    setConfirmDelete(false)
                }
            }))
            .catch((error) => {
                toast.dismiss();
                toast.error('Failed to delete.');
                fetchActivities()
                setConfirmDelete(false)
                console.error(error);
            });
    }

    const formatArrays = (arr: any, type: any) => {
        console.log(arr)
        if (!arr) return ''
        let resultArr: any = []
        arr.map((item: any) => {
            const name = type === 'company' ? item.companyName : formatName(item.firstName, item.lastName)
            let url: any = type === 'company' ? '/marketing/company/' : '/marketing/referral-partners/'
            resultArr.push(<Link className='applicant-name-link' to={`${url}${item?._id}`}>{name}</Link>)
            resultArr.push('\n')
        })
        return resultArr
    }

    function convertISOToTime(isoString: any) {
        const dateObj = new Date(isoString);
        return dateObj.toLocaleTimeString();
    }

    
    const generateRows = (rows: any) => {
        return rows.map((item: any) => {
            if (!renderPartners) {
                if (referralPartnerId) {
                    return {
                        flag: {
                            value: item.flag ? <GrFlagFill color="red" /> : <></>,
                            style: { width: '5%' },
                            selected: item.flag === true,
                        },
                        location: { value: item.location.location, style: { width: '3%' } },
                        date: { value: formatCMDate(item?.completedDate), style: { width: '13%' } },
                        marketingManager: { value: formatName(item?.marketingManager?.firstName || '', item?.marketingManager?.lastName || ''), style: { width: '12%' } },
                        activity: { value: item?.activity?.type, style: { width: '20%' } },
                        description: { value: item?.description, style: { width: '15%' } },
                        finalComments: { value: item?.finalComments, style: { width: '40%' } },
                        state: {
                            currentRow: item
                        }
                    }
                }
                return {
                    flag: {
                        value: item.flag ? <GrFlagFill color="red" /> : <></>,
                        style: { width: '5%' },
                        selected: item.flag === true,
                    },
                    location: { value: item.location.location, style: { width: '3%' } },
                    date: { value: formatCMDate(item?.completedDate), style: { width: '9%' } },
                    marketingManager: { value: formatName(item?.marketingManager?.firstName || '', item?.marketingManager?.lastName || ''), style: { width: '12%' } },
                    activity: { value: item?.activity?.type, style: { width: '20%' } },
                    description: { value: item?.description, style: { width: '10%' } },
                    finalComments: { value: item?.finalComments, style: { width: '30%' } },
                    state: {
                        currentRow: item
                    }
                }
            }
            let obj: any = {
                flag: {
                    value: item.flag ? <GrFlagFill color="red" /> : <></>,
                    style: { width: '5%' },
                    selected: item.flag === true,
                },
                location: { value: item.location.location, style: { width: '3%' } },
                date: { value: formatCMDate(item?.date), style: { width: '10%' } },
                time: { value: formatDateTime(item?.completedTime), style: { width: '10%' } },
                activity: { value: item?.activity?.type, style: { width: '12%' } },
                finalComments: { value: item?.finalComments, style: { width: '20%' } },
                state: {
                    currentRow: item
                }
            }
            if (type === 'Prospect') {
                obj = {
                    flag: {
                        value: item.flag ? <GrFlagFill color="red" /> : <></>,
                        style: { width: '5%' },
                        selected: item.flag === true,
                    },
                    location: { value: item.location.location, style: { width: '10%' } },
                    date: { value: formatCMDate(item?.completedDate), style: { width: '12%' } },
                    time: { value: formatDateTime(item?.completedTime), style: { width: '12%' } },
                    prospect: { value: <Link className='applicant-name-link' to={`/marketing/prospects/${item?.prospect?._id}`}>{item?.prospect?.fullName}</Link>, selected: item?.prospect, style: { width: '20%' } },
                    activity: { value: item?.activity?.type, style: { width: '12%' } },
                    finalComments: { value: item?.finalComments, style: { width: '40%' } },
                    state: {
                        currentRow: item
                    }
                }
            } else if (type === 'Referral Partner') {
                obj = {
                    flag: {
                        value: item.flag ? <GrFlagFill color="red" /> : <></>,
                        style: { width: '5%' },
                        selected: item.flag === true,
                    },
                    location: { value: item.location.location, style: { width: '10%' } },
                    date: { value: formatCMDate(item?.completedDate), style: { width: '12%' } },
                    time: { value: formatDateTime(item?.completedTime), style: { width: '10%' } },
                    referralPartner: { value: formatArrays(item?.referralPartner, 'partner'), style: { width: '10%', whiteSpace: 'pre' } },
                    company: { value: formatArrays(item?.company, 'company'), style: { width: '10%', whiteSpace: 'pre' } },
                    activity: { value: item?.activity?.type, style: { width: '12%' } },
                    finalComments: { value: item?.finalComments, style: { width: '40%' } },
                    state: {
                        currentRow: item
                    }
                }

            } else {
                obj = {
                    flag: {
                        value: item.flag ? <GrFlagFill color="red" /> : <></>,
                        style: { width: '5%' },
                        selected: item.flag === true,
                    },
                    location: { value: item.location.location, style: { width: '10%' } },
                    date: { value: formatCMDate(item?.completedDate), style: { width: '12%' } },
                    time: { value: formatDateTime(item?.completedTime), style: { width: '10%' } },
                    referralPartner: { value: formatArrays(item?.referralPartner, 'partner'), style: { width: '10%', whiteSpace: 'pre' } },
                    company: { value: formatArrays(item?.company, 'company'), style: { width: '8%', whiteSpace: 'pre' } },
                    prospect: { value: <Link className='applicant-name-link' to={`/marketing/prospects/${item?.prospect?._id}`}>{item?.prospect?.fullName}</Link>, selected: item?.prospect, style: { width: '10%' } },
                    activity: { value: item?.activity?.type, style: { width: '12%' } },
                    finalComments: { value: item?.finalComments, style: { width: '40%' } },
                    state: {
                        currentRow: item
                    }
                }
            }
            return obj
        })
    }

    const columns = () => {

        if (!renderPartners) {
            if (referralPartnerId) {
                return ['Flag', 'Location', 'Completed Date', 'Created By', 'Activity Type', 'Description', , '']
            }
            return ['Flag', 'Location', 'Completed Date', 'Created By', 'Activity Type', 'Description', , '']

        } else {
            if (type === 'All') return ['Flag', 'Location', 'Completed Date', 'Time', 'Referral Partner', 'Company', 'Prospect', 'Activity Type', ]
            if (type === 'Referral Partner') return ['Flag', 'Location', 'Completed Date', 'Completed Time', 'Referral Partner', 'Company', 'Activity Type', ]
            return ['Flag', 'Location', 'Created Date', 'Completed Time', 'Prospect', 'Activity Type', ]
        }
    }

    const handleSort = (sortVal: string, type: string, ascending: boolean) => {
        setRows(sort(rows, sortVal, type, ascending, 'marketing-activities'));
    };

    const multipleManagerRowFormat = (data: any, groupBy: string) => {
        let obj: any = {}
        let resultArr: any = []
        if (!groupBy) return data;

        if (data[0]?.data) return data
        data.map((item: any) => {

            let key;

            if (groupBy === 'marketingManager') {
                key = formatName(item.state.currentRow[groupBy].firstName, item.state.currentRow[groupBy].lastName)
            } else {
                key = groupBy === 'month' ? numberToMonth(item['date'].value[0]) : item[groupBy].value
            }
            if (groupBy === 'date') {
                key = formatDisplayedDate(item['date'].value)
            }


            if (!obj[key]) {
                obj[key] = []
            }
            obj[key].push(item)
        })
        for (const key in obj) {
            const sortedData = obj[key].sort((a: any, b: any) => {
                if (a.flag.selected && !b.flag.selected) {
                    return -1; // Move a to the top
                }
                if (!a.flag.selected && b.flag.selected) {
                    return 1; // Move b to the top
                }

                const timeA = new Date(`1970-01-01T${a.time.value}`);
                const timeB = new Date(`1970-01-01T${b.time.value}`);

                const timeStringA = timeA.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false });
                const timeStringB = timeB.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false });

                if (timeStringA < timeStringB) {
                    return -1;
                }
                if (timeStringA > timeStringB) {
                    return 1;
                }
                return 0;
            });
            resultArr.push({ location: key, data: sortedData, count: obj[key].length })
        }
        resultArr.sort((a: any, b: any) => {
            if (groupBy === 'date') {
                return  new Date(b.location).getTime()-new Date(a.location).getTime() 
            } else {
                if (a.location < b.location) {
                    return -1;
                }
                if (a.location > b.location) {
                    return 1;
                }
                return 0;
            }
        });
        return resultArr
    }
    const formatRadioSelection = (selection: any) => {
        const selectionMap: any = {
            'Prospect': 'prospects-detail-log',
            'Referral Partner': 'referral-partner-detail-log'
        }
        return selectionMap[selection];
    }

    useEffect(() => {
        fetchActivities()
      
        handleRefetchComplete && handleRefetchComplete(1);
    }, [filter, currentActivity, shouldRefetch[1], type])

    return (
        <Card>
            {!inline && <CardHeader radioGroup={true} radioGroupLabel1="Referral Partner" radioGroupLabel2='Prospect' type={type} setType={setType} title="Marketing Activities" renderAll setOpenModal={setOpenModal} expanded={expanded} setExpanded={setExpanded} />}
            <Modal open={openModal} closeHandler={handleCloseModal} title={`Add Activity`} >
               {renderButtons && (!referralPartnerId && !prospectId) ? (<><div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px', width: '80%' }}>
                    <Button variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} onClick={() => {
                    setActivityType('Prospect') 
                    setRenderButtons(false)}}>Prospect</Button>
                    <Button variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} onClick={() => {
                        setActivityType('Referral Partner')
                        setRenderButtons(false)
                        }}>Referral Partner</Button>
                </div>
                <ActionButtons closeHandler={() =>{handleCloseModal()}} renderSubmit={false} renderEmail = {false} />
                </>
                ): referralPartnerId ? <MarketingActivitiesModalContent renderCompletedDate activityType = {source === 'referral-partner-detail' ? 'Referral Partner':'Prospect'} source={source} renderPartners={renderPartners} closeHandler={handleCloseModal} fetchActivities={fetchActivities} activity={true} renderButtons={true} />: prospectId ? <MarketingActivitiesModalContent renderCompletedDate activityType = {'Prospect'} source={source} renderPartners={renderPartners} closeHandler={handleCloseModal} fetchActivities={fetchActivities} activity={true} renderButtons={true} /> : <MarketingActivitiesModalContent renderCompletedDate activityType = {activityType} source={source} renderPartners={renderPartners} closeHandler={handleCloseModal} fetchActivities={fetchActivities} activity={true} renderButtons={true} />}
        

            </Modal>
            <Modal currentRow={currentRow} open={openEditModal} closeHandler={handleCloseEditModal} title={`Edit ${title || 'Marketing Activity'}`} radioGroup radioGroupLabel1='Incomplete' radioGroupLabel2='Completed'  >
                {/* <MarketingActivitiesModalContent source = {source} renderPartners={renderPartners} closeHandler={handleCloseEditModal} currentRow={currentRow} fetchActivities={fetchActivities} activity={true} renderButtons={true} /> */}
                <MarketingDailyLogModalContent source = {source} renderPartners={renderP} closeHandler={handleCloseEditModal} currentRow={currentRow} fetchActivities={fetchActivities} activity={true} renderButtons={true} />
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
            {!loading && rows.length > 0 && (
                <Table
                    columns={columns()}
                    rows={multipleManagerRowFormat(rows, formatFilterGroup(filter))}
                    type={filter.groupBy.value === 'None' ? '' : "care-manager-activities"}
                    hideArchive={true}
                    handleEdit={handleEditModal}
                    handleArchive={handleArchive}
                    handleRemove={handleRemove}
                    tableName='Marketing-Activities'
                    handleSort={handleSort}
                />
            )}
            {!loading && rows.length === 0 && <NoData />}
        </Card>
    );
}

export default MarketingActivititesTable
