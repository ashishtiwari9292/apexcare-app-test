import CompaniesModalContent from './CompaniesModalContent';
import ReferralPartnersModalContent from './ReferralPartnersModalContent'

interface Props {
    closeMe: (data:any) => void;
    currentRow?: any;
    detail?: boolean
    type:any
}

function ReferralPartnersModal(props: Props) {
    const { type , closeMe, currentRow} = props

    if(type === "Referral Partners") return (
        <ReferralPartnersModalContent closeMe = {closeMe} currentRow = {currentRow || null}  type = {type}/>
    )
    if(type === 'Companies') return (
        <CompaniesModalContent closeMe = {closeMe} currentRow = {currentRow || null} type = {type}/>
    )
    return <></>
}

export default ReferralPartnersModal
