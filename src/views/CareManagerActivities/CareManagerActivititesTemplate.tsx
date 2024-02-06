import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent, ArchiveModal, ActionButtons } from 'components';
import { SectionProps } from 'typings';
import { careManagerSort } from 'lib';
import TemplateModal from './TemplateModal';
import TemplateModalContent from './TemplateModalContent';

export function CareManagerActivitiesTemplate({ filter, data, type, setActivities }: SectionProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [templates, setTemplates] = useState<any>([])
    const [openAddModal, setOpenAddModal] = useState<boolean>(false);
    const [openSelectionModal, setSelectionModal] = useState<boolean>(false)
    const [openRemoveModal, setRemoveModal] = useState<boolean>(false)
    const [expanded, setExpanded] = useState<boolean>(true);
    const [editTemplateModal, setEditTemplateModal] = useState<boolean>(false)
    const [rows, setRows]: any[] = useState([]);
    const [archiveOpenModal, setArchiveOpenModal] = useState<boolean>(false);
    const [editOpenModal, setEditOpenModal] = useState<boolean>(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [removeTemplateModal, setRemoveTemplateModal] = useState<boolean>(false);

    const timeToNextActivityFormatter = (val: string) => {
        let timeConditions: any = {
            d: 'Days',
            m: 'Months'
        }
        if (!val) return ''
        return `${val.slice(0, val.length - 1)} ${timeConditions[val[val.length - 1]]}`
    }

    const generateTemplateRows = (data: any[]) => {
        let formattedTemplates: any = {}
        let resultArr: any = []
        data.map((rowObj) => {
            if (!formattedTemplates[rowObj.name]) {
                formattedTemplates[rowObj.name] = []
            }
            rowObj.activities.map((activityObj: any, idx: number) => {

                formattedTemplates[rowObj.name].push({ template: { value: '', style: { width: '30%' } }, activity: { value: activityObj.type, style: { width: '30%' } }, timeToNextActivity: { value: timeToNextActivityFormatter(activityObj.dateCalculator), style: { width: '30%' } }, state: { _id: rowObj._id, idx: idx } })
            })
        })
        for (const key in formattedTemplates) {
            resultArr.push({ location: key, data: formattedTemplates[key] })
        }
        return resultArr
    }
    const fetchData = useCallback(() => {
        setLoading(true);
        setRows([]);
        const url = '/activity-template'

        API.get(url)
            .then((rsp: any) => {
                const data = rsp.data.data;
                setRows(generateTemplateRows(data))
                setLoading(false);
            })
            .catch((error: any) => {
                toast.error('Failed to load Care Manager Activities.');
                console.error(error);
                setLoading(false);
            });
    }, [filter]);

    useEffect(() => {
        fetchData();
    }, [filter]);


    const handleRemove = (item: any) => {
        setSelectedRow(item)
        setRemoveModal(true)
    }
    const handleCloseRemoveModal = () => {
        fetchData();
        setRemoveModal(false)
    }
    const handleCloseRemoveTemplateModal = () => {
        fetchData()
        setRemoveTemplateModal(false)
    }
    const handleCloseAddModal = () => {
        fetchData();
        setOpenAddModal(false);
    };
    const editHandleCloseModal = () => {
        fetchData();
        setEditOpenModal(false);
    };
    const editTemplateCloseModal = () => {
        fetchData()
        setEditTemplateModal(false)
    }
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
    const handleReactivate = () => {
        fetchData();
    };
    const handleSort = (sortVal: string, type: string, ascending: boolean) => {
        setRows(careManagerSort(rows, sortVal, type, ascending, 'careManagerActivities', true))
    }
    const handleEditDropDown = (templateObj: any) => {
        setSelectedRow(templateObj)
        setEditTemplateModal(true)
    }
    const handleRemoveDropDown = (id: any) => {
        setSelectedRow(id)
        setRemoveTemplateModal(true)
    }

    const confirmHandler = () => {
        toast.loading('Updating template...');
        API.post(`/activity-template/activity`, { _id: selectedRow.state._id, idx: selectedRow.state.idx })
            .then((rsp) => {
                toast.dismiss();
                if (rsp.data.success) {
                    toast.success('Successfully removed activity from template.');
                    handleCloseRemoveModal();
                }
            })
            .catch((error) => {
                toast.dismiss();
                toast.error('Failed to remove activity from template.');
                handleCloseRemoveModal();
                console.error(error);
            });
    };

    const confirmRemoveHandler = () => {
        toast.loading('Deleting Template...');
        API.post(`/activity-template/remove`, { _id: selectedRow.data[0].state._id })
            .then((rsp) => {
                toast.dismiss();
                if (rsp.data.success) {
                    toast.success('Successfully removed template.');
                    handleCloseRemoveTemplateModal();
                }
            })
            .catch((error) => {
                toast.dismiss();
                toast.error('Failed to remove template.');
                handleCloseRemoveModal();
                console.error(error);
            });
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
            <CardHeader
                title="Care Manager Task Templates"
                setOpenModal={setOpenAddModal}
                expanded={expanded}
                setExpanded={setExpanded}
            />
            <Modal open={openAddModal} closeHandler={handleCloseAddModal} title=" Add Template"  >
                <TemplateModal closeHandler={handleCloseAddModal} />
            </Modal >

            {loading && <Spinner />}
            {!loading && rows.length === 0 && <NoData />}
            {!loading && rows.length > 0 && (
                <CardContent expanded={expanded}>
                    <Modal open={editOpenModal} closeHandler={editHandleCloseModal} title="Edit Template">
                        <TemplateModalContent closeHandler={editHandleCloseModal} selected={selectedRow} />
                    </Modal>
                    <Modal open={editTemplateModal} closeHandler={editTemplateCloseModal} title=" Edit Template" >
                        <TemplateModal closeHandler={editTemplateCloseModal} data={selectedRow} />
                    </Modal >
                    <Modal open={openRemoveModal} closeHandler={handleCloseRemoveModal} title="Confirm Remove Task" styles={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '30%',
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                    }}>
                        <ActionButtons renderSubmit={false} renderConfirm={true} confirmHandler={confirmHandler} closeHandler={handleCloseRemoveModal}></ActionButtons>
                    </Modal>
                    <Modal open={removeTemplateModal} closeHandler={handleCloseRemoveTemplateModal} title="Confirm Delete Template" styles={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '30%',
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                    }}>
                        <ActionButtons renderSubmit={false} renderConfirm={true} confirmHandler={confirmRemoveHandler} closeHandler={handleCloseRemoveTemplateModal}></ActionButtons>
                    </Modal>

                    <ArchiveModal
                        open={archiveOpenModal}
                        closeHandler={archiveHandleCloseModal}
                        collectionName="care-manager-activity-event"
                        selected={selectedRow}
                        label="Care Manager Task"
                    />
                    <Table
                        columns={[
                            { val: 'Template', width: '30%' },
                            { val: 'Activity', width: '25%' },
                            { val: 'Time Untill Activity', width: '35%' },

                        ]}
                        tableName="care-manager-activity-event"
                        rows={rows}
                        handleArchive={handleArchive}
                        handleEdit={handleEdit}
                        handleEditDropDown={handleEditDropDown}
                        hideArchive={true}
                        handleSort={handleSort}
                        handleReactivate={handleReactivate}
                        handleRemove={handleRemove}
                        handleRemoveDropDown={handleRemoveDropDown}
                        type={'template'}
                    />
                </CardContent>
            )}
        </Card>
    );
}