import { useFormik } from 'formik';
import * as yup from 'yup';
import {
    Box,
    InputLabel,
    Button,
    Select,
    MenuItem,
    CardHeader as MuiCardHeader,
    FormControl,
    Stack,
    Autocomplete as MuiAutocomplete,

} from '@mui/material';
import API from '../../services/AxiosConfig';
import { toast } from 'react-toastify';
import { useAuth, useCompany } from 'hooks';
import { ArchiveModal, Checkbox, FormAutocomplete, FormDatePicker, FormInput } from 'components';
import { useState, useEffect, useMemo } from 'react';
import Autocomplete from 'components/Form/Autocomplete';
import { useParams } from 'react-router-dom';
import { stateList } from '../../views/ReferralPartners/statesList';


function InitialCallCarePlan({ closeMe, detail = false, callback, prospectId}: any) {
    const { user } = useAuth();
    const [currentRow, setCurrentRow] = useState<any>({})
    const validationSchema = yup.object({

    });

    const createInitialCarePlan = (values: any) => {
        callback(values)
    };

    const editInitialCarePlan = (values: any) => {
        const edited = API.put('/initialCarePlan', {initialCarePlan:values,prospect:prospectId})
        .then(rsp => {
            console.log(rsp)
            toast.success('Updated initial call care plan')
            closeMe()
        })
    }
    
    const getPlan = () => {
        const plan = API.get(`/initialCarePlan/${prospectId}`)
        .then(rsp => {
           setCurrentRow(rsp.data)
        })
        .catch(err => {
            console.log(err)
        })
    }
    useEffect(() => {
        formik.setFieldValue('initialContact', new Date())
    }, [])

    useEffect(()=>{
        if(prospectId){
            getPlan()
        }
    },[prospectId])

    const formik = useFormik({
        initialValues: {
            careGoals: currentRow?.careGoals || '',
            initialContact: currentRow?.initialContact || '',
            startDate: currentRow?.startDate || '',
            livesWith: currentRow?.livesWith || '',
            medicalConditions: currentRow?.medicalConditions || '',
            mentalBehaviorConditions: currentRow?.mentalBehaviorConditions || '',
            ambulationNotes: currentRow?.ambulationNotes || '',
            needsMedication: currentRow?.needsMedication || '',
            medicationManager: currentRow?.medicationManager || '',
            medications: currentRow?.medications || '',
            specialDiet: currentRow?.specialDiet || '',
            breakfast: currentRow?.breakfast || '',
            snack: currentRow?.snack || '',
            lunch: currentRow?.lunch || '',
            dinner: currentRow?.dinner || '',
            mealNotes: currentRow?.mealNotes || '',
            drivingNotes: currentRow?.drivingNotes || '',
        },
        
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            prospectId ? editInitialCarePlan(values) : createInitialCarePlan(values)
            // closeMe && closeMe();
        },
    });


    return (
        <>
            <form onSubmit={formik.handleSubmit}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h2 className="fs-30 pt">{'Initial Call Care Plan'}</h2>
                    </div>
                <Stack style={{ padding: detail ? '30px 5vw 50px 5vw' : '20px', }}>
                    <Box
                        sx={{
                            padding: '20px 0px 10px 0px',
                            display: 'grid',
                            gridTemplateColumns: '49% 49%',
                            gap: '5px'
                        }}
                    >
                        <div style={{ marginTop: '-10px', gridColumn: '1/3' }}>
                            <FormInput
                                labelProps={{
                                    shrink: true,
                                }}
                                type="text"
                                name="careGoals"
                                label="Care Goals"
                                value={formik.values.careGoals}
                                onChange={formik.handleChange}
                                error={formik.touched.careGoals && Boolean(formik.errors.careGoals)}
                                helperText={formik.touched.careGoals && formik.errors.careGoals}
                                textarea
                            />
                        </div>
                        <FormDatePicker
                            name="initialContact"
                            label={'Initial Contact'}
                            value={formik.values.initialContact}
                            onChange={formik.handleChange}
                            error={formik.touched.initialContact && Boolean(formik.errors.initialContact)}
                            helperText={formik.touched.initialContact && formik.errors.initialContact}
                            pickerOnChange={(newValue: String | null) => {
                                if (newValue) {
                                    formik.setFieldValue('initialContact', newValue);
                                }
                            }}
                        />
                        <FormDatePicker
                            name="startDate"
                            label={'Start Date'}
                            value={formik.values.startDate}
                            onChange={formik.handleChange}
                            error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                            helperText={formik.touched.startDate && formik.errors.startDate}
                            pickerOnChange={(newValue: String | null) => {
                                if (newValue) {
                                    formik.setFieldValue('startDate', newValue);
                                }
                            }}
                        />
                        <div style={{ gridColumn: '1/3' }}>
                            <FormInput
                                labelProps={{
                                    shrink: true,
                                }}
                                type="text"
                                name="livesWith"
                                label="Lives With"
                                value={formik.values.livesWith}
                                onChange={formik.handleChange}
                                error={formik.touched.livesWith && Boolean(formik.errors.livesWith)}
                                helperText={formik.touched.livesWith && formik.errors.livesWith}
                            />
                        </div>
                        <div style={{ gridColumn: '1/3' }}>
                            <FormInput
                                labelProps={{
                                    shrink: true,
                                }}
                                type="text"
                                name="medicalConditions"
                                label="Medical Conditions"
                                value={formik.values.medicalConditions}
                                onChange={formik.handleChange}
                                error={formik.touched.medicalConditions && Boolean(formik.errors.medicalConditions)}
                                helperText={formik.touched.medicalConditions && formik.errors.medicalConditions}
                                textarea
                            />
                        </div>
                        <div style={{ gridColumn: '1/3' }}>
                            <FormInput
                                labelProps={{
                                    shrink: true,
                                }}
                                type="text"
                                name="mentalBehaviorConditions"
                                label="Mental / Behavior Conditions"
                                value={formik.values.mentalBehaviorConditions}
                                onChange={formik.handleChange}
                                error={formik.touched.mentalBehaviorConditions && Boolean(formik.errors.mentalBehaviorConditions)}
                                helperText={formik.touched.mentalBehaviorConditions && formik.errors.mentalBehaviorConditions}
                                textarea
                            />
                        </div>
                        <div style={{ gridColumn: '1/3' }}>
                            <FormInput
                                labelProps={{
                                    shrink: true,
                                }}
                                type="text"
                                name="ambulationNotes"
                                label="Ambulation Notes"
                                value={formik.values.ambulationNotes}
                                onChange={formik.handleChange}
                                error={formik.touched.ambulationNotes && Boolean(formik.errors.ambulationNotes)}
                                helperText={formik.touched.ambulationNotes && formik.errors.ambulationNotes}
                                textarea
                            />
                        </div>

                        <FormControl>
                            <InputLabel shrink style={{ color: formik.touched.needsMedication && formik.errors.needsMedication ? 'red' : '' }} id="demo-simple-select-label">Needs medication / supplement reminders?</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={formik.values.needsMedication}
                                name="needsMedication"
                                error={formik.touched.needsMedication && Boolean(formik.errors.needsMedication)}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        formik.setFieldValue('needsMedication', e.target.value)
                                    }
                                }}
                            >
                                {['', 'Yes', 'No', 'Undetermined'].map((needsMedication: any) => (
                                    <MenuItem value={needsMedication}>{needsMedication}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <div style={{ marginTop: '-10px' }}>
                            <FormInput
                                labelProps={{
                                    shrink: true,
                                }}
                                type="text"
                                name="medicationManager"
                                label="Who manages medications / supplements"
                                value={formik.values.medicationManager}
                                onChange={formik.handleChange}
                                error={formik.touched.medicationManager && Boolean(formik.errors.medicationManager)}
                                helperText={formik.touched.medicationManager && formik.errors.medicationManager}

                            />
                        </div>
                        <div style={{ gridColumn: '1/3' }}>
                            <FormInput
                                labelProps={{
                                    shrink: true,
                                }}
                                type="text"
                                name="medications"
                                label="Medications"
                                value={formik.values.medications}
                                onChange={formik.handleChange}
                                error={formik.touched.medications && Boolean(formik.errors.medications)}
                                helperText={formik.touched.medications && formik.errors.medications}
                                textarea
                            />
                        </div>
                        <div style={{ gridColumn: '1/3' }}>
                            <FormInput
                                labelProps={{
                                    shrink: true,
                                }}
                                type="text"
                                name="specialDiet"
                                label="Special Diet"
                                value={formik.values.specialDiet}
                                onChange={formik.handleChange}
                                error={formik.touched.specialDiet && Boolean(formik.errors.specialDiet)}
                                helperText={formik.touched.specialDiet && formik.errors.specialDiet}
                            />
                        </div>
                        <FormInput
                            labelProps={{
                                shrink: true,
                            }}
                            type="text"
                            name="breakfast"
                            label="Break Fast"
                            value={formik.values.breakfast}
                            onChange={formik.handleChange}
                            error={formik.touched.breakfast && Boolean(formik.errors.breakfast)}
                            helperText={formik.touched.breakfast && formik.errors.breakfast}
                        />
                        <FormInput
                            labelProps={{
                                shrink: true,
                            }}
                            type="text"
                            name="snack"
                            label="Snack"
                            value={formik.values.snack}
                            onChange={formik.handleChange}
                            error={formik.touched.snack && Boolean(formik.errors.snack)}
                            helperText={formik.touched.snack && formik.errors.snack}
                        />
                        <FormInput
                            labelProps={{
                                shrink: true,
                            }}
                            type="text"
                            name="lunch"
                            label="Lunch"
                            value={formik.values.lunch}
                            onChange={formik.handleChange}
                            error={formik.touched.lunch && Boolean(formik.errors.lunch)}
                            helperText={formik.touched.lunch && formik.errors.lunch}
                        />
                        <FormInput
                            labelProps={{
                                shrink: true,
                            }}
                            type="text"
                            name="dinner"
                            label="Dinner"
                            value={formik.values.dinner}
                            onChange={formik.handleChange}
                            error={formik.touched.dinner && Boolean(formik.errors.dinner)}
                            helperText={formik.touched.dinner && formik.errors.dinner}
                        />
                        <div style={{ gridColumn: '1/3' }}>
                            <FormInput
                                labelProps={{
                                    shrink: true,
                                }}
                                type="text"
                                name="mealNotes"
                                label="Meal Notes"
                                value={formik.values.mealNotes}
                                onChange={formik.handleChange}
                                error={formik.touched.mealNotes && Boolean(formik.errors.mealNotes)}
                                helperText={formik.touched.mealNotes && formik.errors.mealNotes}
                            />
                        </div>
                        <div style={{ gridColumn: '1/3' }}>
                            <FormInput
                                labelProps={{
                                    shrink: true,
                                }}
                                type="text"
                                name="drivingNotes"
                                label="Driving Notes"
                                value={formik.values.drivingNotes}
                                onChange={formik.handleChange}
                                error={formik.touched.drivingNotes && Boolean(formik.errors.drivingNotes)}
                                helperText={formik.touched.drivingNotes && formik.errors.drivingNotes}
                            />
                        </div>
                        <div style={{ gridColumn: '1/3', display: 'flex', justifyContent: 'space-between' }}>
                            <Button onClick={() => closeMe()} variant="contained" sx={{ bgcolor: '#a3a3ab' }} type="button">
                                Cancel
                            </Button>
                            <Button variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} type="submit">
                                {prospectId ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </Box>
                </Stack>

            </form>
        </>
    )
}

export default InitialCallCarePlan
