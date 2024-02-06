import React, { useCallback, useEffect, useState } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, FormControl, Stack, InputLabel, MenuItem, Select, TextField ,FormHelperText} from '@material-ui/core';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { FormAutocomplete, ActionButtons, Modal, } from 'components';
import { useAuth, useCompany } from 'hooks';
import { ModalProps } from 'typings';
import { Button } from '@material-ui/core';
import PermissionModal from './PermissionModal';


interface UserManagementInputProps {
    location: any;
    phone: string;
    email: string;
    dataStatus: string,
    firstName: string,
    lastName: string,
    password: string,
    confirmPassword: string,
    role: string,
}

const UserManagementModalContent = ({ closeHandler, selected }: ModalProps): JSX.Element => {
    const { locations, users, setUsers } = useCompany();
    const { user } = useAuth();
    const [permissionModal, setPermissionModal] = useState(false)
    const [roles, setRoles] = useState([])
    const [userLocations, setUserLocations] = useState([])
    const initialValues: UserManagementInputProps = {
        location: selected ? selected?.state.location : null,
        phone: selected ? selected?.phone?.value : '',
        email: selected ? selected?.email.value : '',
        dataStatus: selected ? selected.status.value : 'Active',
        firstName: selected ? selected.state.firstName : '',
        lastName: selected ? selected.state.lastName : '',
        password: selected ? selected.state.password : '',
        confirmPassword: selected ? selected.state.password : '',
        role: selected ? selected?.state?.role._id : '',

    };

    const fetchData = useCallback(() => {
        API.get(`permissions/${selected.id}`)
            .then((rsp: any) => {
                setUserLocations(rsp.data.data)
            }).catch(err => {
                console.log(err)
            })
    }, []);

    const validationEditSchema = yup.object({
        location: yup.object().typeError('Select your location').required('Location is required'),
        password: yup.string().required('Password is required').min(6, 'Password should be of minimum 6 characters length'),
        confirmPassword: yup.string().required('Please enter your password')
           .oneOf([yup.ref('password'), null], 'Passwords must match').min(6, 'Password should be of minimum 6 characters length'),
        role:yup.string().required('Role is requires'),
        email:yup.string().typeError('must be a valid email').required('Email is required'),
        firstName:yup.string().required('First name is required'),
        lastName:yup.string().required('Last name is required'),
    });
    const validationSchema = yup.object({
        location: yup.object().typeError('Select your location').required('Location is required'),
        role:yup.string().required('Role is requires'),
        email:yup.string().typeError('must be a valid email').required('Email is required'),
        firstName:yup.string().required('First name is required'),
        lastName:yup.string().required('Last name is required'),
    });



    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: selected ? validationSchema : validationEditSchema,
        onSubmit: (values) => {
            selected ? editUser(values) : createUser(values);
            closeHandler();
        },
    });

    const fetchRoles = async () => {
        API.get('roles')
            .then((rsp) => setRoles(rsp.data.data))
    }
    const handleCloseModal = () => {
        setPermissionModal(false)
    }
    const createUser = (values: any) => {
        API.post(`user/create`, values)
            .then((rsp) => {
                if (rsp.data.success) {
                    toast.success('Successfully added user.');
                    closeHandler();
                }
            })
            .catch((error) => {
                toast.error('Failed to add user.');
                console.error(error);
            });
    };
    const editUser = (values: any) => {
        API.put(`user/edit/${selected.state.id}`, values)
            .then((rsp) => {
                API.get('user/Active')
                .then(({data})=>{
                    setUsers(data.data)
                    toast.success('Successfully edit user.');
                    closeHandler();
                })
            })
            .catch((error) => {
                toast.error('Failed to edit user.');
                console.error(error);
            });
    }
    useEffect(() => {
        selected && fetchData()
        fetchRoles()
    }, [])


    return (
        <form onSubmit={formik.handleSubmit}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto auto',
                    gap: '13px',
                }}
            >
                <Modal open={permissionModal} closeHandler={handleCloseModal} title="Edit User Permission" styles={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '30%',
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }} >
                    <PermissionModal locations={userLocations} selected={selected} fetchData={fetchData} />
                </Modal>
                <FormAutocomplete
                    name="location"
                    label="Location"
                    value={formik.values.location}
                    onChange={formik.handleChange}
                    error={formik.touched.location && Boolean(formik.errors.location)}
                    helperText={formik.touched.location && formik.errors.location}
                    autocompleteValue={formik.values.location}
                    options={locations}
                    getOptions={(option: any) => option.location}
                    autocompleteOnChange={(event: any, newValue: String | null) => {
                        formik.setFieldValue('location', newValue);
                    }}
                    required
               
                />
                <div></div>
                <FormControl fullWidth >
                    <InputLabel style={{ color: formik.touched.role && formik.errors.role ? 'red' : '' }} id="demo-simple-select-label">Role*</InputLabel>
                    <Select
                        id="demo-simple-select"
                        value={formik.values.role}
                        label="Role*"
                        name="role"
                        error={formik.touched.role && Boolean(formik.errors.role)}
                        onChange={(e) => {
                            if (e.target.value) {
                                formik.setFieldValue('role', e.target.value)
                            }
                        }}
                    >
                        {roles.map((status: any) => (
                            <MenuItem value={status._id}>{status.role}</MenuItem>
                        ))}

                    </Select>
                 {  formik.touched.firstName && formik.errors.firstName && <FormHelperText   sx={{ color: "#bf3333", marginLeft: "16px !important" }}>Role is required</FormHelperText>}
                </FormControl>
                <FormControl sx={{ width: '100%' }}>
                    <TextField
                        type="text"
                        id="my-input"
                        aria-describedby="my-helper-text"
                        name="email"
                        multiline
                        maxRows={4}
                        label="Email*"
                        value={formik.values.email ? formik.values.email : ''}
                        onChange={formik.handleChange}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />
                </FormControl>
                <FormControl sx={{ width: '100%' }}>
                    <TextField
                        type="text"
                        id="my-input"
                        aria-describedby="my-helper-text"
                        name="firstName"
                        multiline
                        maxRows={4}
                        label="First Name*"
                        value={formik.values.firstName ? formik.values.firstName : ''}
                        onChange={formik.handleChange}
                        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                        helperText={formik.touched.firstName && formik.errors.firstName}
                    />
                </FormControl>
                <FormControl sx={{ width: '100%' }}>
                    <TextField
                        type="text"
                        id="my-input"
                        aria-describedby="my-helper-text"
                        name="lastName"
                        multiline
                        maxRows={4}
                        label="Last Name*"
                        value={formik.values.lastName ? formik.values.lastName : ''}
                        onChange={formik.handleChange}
                        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                        helperText={formik.touched.lastName && formik.errors.lastName}
                    />
                </FormControl>
                <FormControl sx={{ width: '100%' }}>
                    <TextField
                        type="text"
                        id="my-input"
                        aria-describedby="my-helper-text"
                        name="phone"
                        multiline
                        maxRows={4}
                        label="Phone"
                        inputProps={{ inputmode: 'numeric', pattern: '[0-9]*', maxLength: 12 }}
                        value={formik.values.phone ? formik.values.phone : ''}
                        onChange={(e) => {
                            const re = /^[0-9-( )]+$/gm
                            if (e.target.value === '' || re.test(e.target.value)) {
                                formik.setFieldValue('phone', e.target.value)
                            }
                        }}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                    />
                </FormControl>
                <FormControl fullWidth >
                    <InputLabel style={{ color: formik.touched.dataStatus && formik.errors.dataStatus ? 'red' : '' }} id="demo-simple-select-label">Status*</InputLabel>
                    <Select
                        id="demo-simple-select"
                        value={formik.values.dataStatus}
                        label="Status*"
                        name="status"
                        error={formik.touched.dataStatus && Boolean(formik.errors.dataStatus)}

                        onChange={(e) => {
                            if (e.target.value) {
                                formik.setFieldValue('dataStatus', e.target.value)
                            }
                        }}
                    >
                        {['Active', 'Inactive'].map((status: any) => (
                            <MenuItem value={status}>{status}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {!selected && (<><FormControl sx={{ width: '100%' }}>
                    <TextField
                        type="password"
                        name="password"
                        label="Password*"
                        value={formik.values.password ? formik.values.password : ''}
                        onChange={formik.handleChange}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />
                </FormControl>
                    <FormControl sx={{ width: '100%' }}>
                        <TextField
                            label="Confirm Password*"
                            type="Password"
                            aria-describedby="my-helper-text"
                            name="confirmPassword"
                            value={formik.values.confirmPassword ? formik.values.confirmPassword : ''}
                            onChange={formik.handleChange}
                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                        />
                    </FormControl>
                </>)
                
                }
                {selected && <Button style={{}} onClick={() => setPermissionModal(true)}>Edit Permissions</Button>}
            </Box>
            <ActionButtons closeHandler={closeHandler} />
        </form>
    );
};
export default UserManagementModalContent;




/*     <FormAutocomplete
            name="user"
            label="User"
            value={formik.values.user}
            onChange={formik.handleChange}
            error={formik.touched.user && Boolean(formik.errors.user)}
            helperText={formik.touched.user && formik.errors.user}
            autocompleteValue={formik.values.user}
            getOptions={(option: any) => `${option.firstName} ${option.lastName}`}
            options={ users }
            autocompleteOnChange={(event: any, newValue: any | null) => {
                    if (!newValue._id) {
                        formik.setFieldValue('user', formik.values.user);
                    } else {
                         formik.setFieldValue('user', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
                    }
                 }}
                />
        <FormAutocomplete
            name="location"
            label="Location"
            value={formik.values.location}
            onChange={formik.handleChange}
            error={formik.touched.location && Boolean(formik.errors.location)}
            helperText={formik.touched.location && formik.errors.location}
            autocompleteValue={formik.values.location}
            options={locations}
            getOptions={(option: any) => option.location}
            autocompleteOnChange={(event: any, newValue: String | null) => {
                   formik.setFieldValue('location', newValue);
                 }}
            required
            /> */