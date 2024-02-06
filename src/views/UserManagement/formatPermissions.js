import { formatName } from "lib"

export function formatPermissions(permissions) {
    const resultObj = {}
    const resultArr = []
    permissions.data.data.map(permObj => {
        const obj = {
            user: { value: "", style: { width: '43%' } },
            location: { value: permObj.location.location, style: {fontSize:'larger'} },
            state: { value: { locationId: permObj.location._id, userLocation: permObj.user.location.location, userId:permObj.user._id } }
        }
        if (resultObj[formatName(permObj.user.firstName, permObj.user.lastName)]) {
            resultObj[formatName(permObj.user.firstName, permObj.user.lastName)].push(obj)
            return
        }
        resultObj[formatName(permObj.user.firstName, permObj.user.lastName)] = [obj]
    })
    for (const key in resultObj) {
        resultArr.push({ location: key, data: resultObj[key] })
    }
    return resultArr
}
