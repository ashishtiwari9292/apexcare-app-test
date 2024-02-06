import { formatName, formatDate } from "lib"

export function formatUsers(users) {
    console.log('users',users)
    return users.map((row) => ({
        id:row._id,
        status:{value: row.dataStatus, style :{width:'10%'}},
        name: { value: formatName(row.firstName, row.lastName), style: { width: '15%' } },
        location: { value: row.location.location, style: { width: '15%' } },
        phone: { value: row.phone, style: { width: '15%' } },
        email: { value: row.email, style: { width: '20%', textOverflow: 'ellipsis' } },
        createdAt: { value: row.createdAt ? formatDate(row.createdAt) : '', style: { width: '30%' } },
        state: { id: row._id, location: row.location, firstName: row.firstName, lastName: row.lastName, password :row.password , role:row.roles[0]}
    }));
};

