import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'App.css';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import {
  ForgetPassword,
  Login,
  ResetPassword,
  QuickHits,
  ClientsListing,
  ClientDetail,
  CarePartnersListing,
  CarePartnerDetail,
  Applicants,
  RecruitingDashboard,
  RecruitingGrid,
  CareMangerDetail
} from 'pages';
import PrivateRoute from 'routes/PrivateRoute';
import { ApplicantDetails } from 'pages/Recruiting/applicants/ApplicantDetails';
import { AuthContextProvider } from 'hooks/useAuth';
import { CompanyContextProvider } from 'hooks/useCompany';
import { AwardManagement } from 'pages/CarePlanning/AwardManagement/AwardManagement';
import { UserManagement } from 'pages/UserManagement';
import { StageManagement } from 'pages/StageManagement';
import { AwardTypeManagement } from 'views/AwardTypeManagement/AwardTypeManagement';
import { ActivityManagement } from 'views/ActivityManagement/ActivityManagement';
import AdminRoute from 'routes/AdminRoute';
import { LocationManagement } from 'pages/LocationManagement';
import ReferralPartners from 'pages/Marketing/ReferralPartners/ReferralPartners';
import { ReferralPartnerDetail } from 'pages/ReferralPartnerDetail/ReferralPartnerDetail';
import ProspectDetail from 'views/Prospects/ProspectDetail';
import { CompanyDetail } from 'pages/CompanyDetail/CompanyDetail';
import Prospects from 'pages/Marketing/Prospects/Prospects';
import MarketingActivities from 'pages/Marketing/MarketingActivities/MarketingActivities';
import { MarketingManagement } from 'pages/Marketing/MarketingManagement';
import { ManagementTable } from 'views/MarketingActivitites/Management/ManagementTable';
import { FilterProvider } from 'pages/Marketing/ReferralPartners/ReferralFilterContext';

let theme: any = createTheme({
  typography: {},
  palette: {
    primary: {
      main: '#5b73e8',
    },
  },
});

theme = responsiveFontSizes(theme);

function App() {
  return (

    <ThemeProvider theme={theme}>
      <CompanyContextProvider>
        <AuthContextProvider>
          <FilterProvider>
          <div className="App">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/forget-password" element={<ForgetPassword />} />
                <Route path="/password-reset/:resetToken" element={<ResetPassword />} />
                <Route
                  path="/quick-hits"
                  element={
                    <PrivateRoute>
                      <QuickHits />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/clients"
                  element={
                    <PrivateRoute>
                      <ClientsListing />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/client/:clientId"
                  element={
                    <PrivateRoute>
                      <ClientDetail />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/marketing/referral-partners/:referralPartnerId"
                  element={
                    <PrivateRoute>
                      <ReferralPartnerDetail/>
                    </PrivateRoute>
                  }
                />
                 <Route
                  path="/marketing/management"
                  element={
                    <PrivateRoute>
                 <MarketingManagement/>
                    </PrivateRoute>
                  }
                />
                  <Route
                  path="/referral-partners"
                  element={
                    <PrivateRoute>
                 <ManagementTable url = 'referral-partners' title = "Referral Partners" objkey = "companyType"/>
                    </PrivateRoute>
                  }
                />
                  <Route
                  path="/referral-activity"
                  element={
                    <PrivateRoute>
                 <ManagementTable url = 'marketing/type' title = "Referral Partners Activity" objkey = "type"/>
                    </PrivateRoute>
                  }
                />
                    <Route
                  path="/prospect-activity"
                  element={
                    <PrivateRoute>
                <ManagementTable url = 'marketing/type' title = "Prospect Activity" objkey = "type"/>
                    </PrivateRoute>
                  }
                />
                   <Route
                  path="/stage-options"
                  element={
                    <PrivateRoute>
                 <ManagementTable url = '/stage-options' title = "Prospect Stage" objkey = "type"/>
                    </PrivateRoute>
                  }
                />
                   <Route
                  path="/lost-client"
                  element={
                    <PrivateRoute>
                 <ManagementTable url = '/lost-client' title = "Lost Client Reasons" objkey = "type"/>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/contact-types"
                  element={
                    <PrivateRoute>
                 <ManagementTable url = '/contact-type' title = "Contact Types" objkey = "type"/>
                    </PrivateRoute>
                  }
                />
                  <Route
                  path="/client-deactivation"
                  element={
                    <PrivateRoute>
                 <ManagementTable url = '/client' title = "Contact Deactivation Reasons" objkey = "type"/>
                    </PrivateRoute>
                  }
                />
                 <Route
                  path="/care-partner-deactivation"
                  element={
                    <PrivateRoute>
                 <ManagementTable url = '/care-partner' title = "Care Partner Deactivation Reasons" objkey = "type"/>
                    </PrivateRoute>
                  }
                />
                  <Route
                  path="/contact-relationships"
                  element={
                    <PrivateRoute>
                 <ManagementTable url = '/contact-relationships' title = "Contact Types" objkey = "type"/>
                    </PrivateRoute>
                  }
                />
                  <Route
                  path="/lead-source"
                  element={
                    <PrivateRoute>
                 <ManagementTable url = '/lead-source' title = "Lead Source" objkey = "type"/>
                    </PrivateRoute>
                  }
                />
                   <Route
                  path="/marketing/company/:referralPartnerId"
                  element={
                    <PrivateRoute>
                      <CompanyDetail/>
                    </PrivateRoute>
                  }
                />
                 <Route
                  path="/marketing/activities"
                  element={
                    <PrivateRoute>
                      <MarketingActivities/>
                    </PrivateRoute>
                  }
                />
                     <Route
                  path="/marketing/prospects/:prospectId"
                  element={
                    <PrivateRoute>
                      <ProspectDetail/>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/care-partners"
                  element={
                    <PrivateRoute>
                      <CarePartnersListing />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/care-management"
                  element={
                    <PrivateRoute>
                      <CareMangerDetail />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/care-partner/:carePartnerId"
                  element={
                    <PrivateRoute>
                      <CarePartnerDetail />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/recruiting/status"
                  element={
                    <PrivateRoute>
                      <RecruitingDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/recruiting/snapshot"
                  element={
                    <PrivateRoute>
                      <RecruitingGrid />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/marketing/referral-partners"
                  element={
                    <PrivateRoute>
                      <ReferralPartners />
                    </PrivateRoute>
                  }
                />
                      <Route
                  path="/marketing/prospects"
                  element={
                    <PrivateRoute>
                      <Prospects />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/award-management"
                  element={
                    <PrivateRoute>
                      <AwardManagement admin={false} />
                      </PrivateRoute>
                  }
                />
                <Route
                  path="/vendor-management"
                  element={
                    <AdminRoute>
                      <AwardManagement admin/>
                      </AdminRoute>
                  }
                />
                <Route
                  path="/recruiting/applicants"
                  element={
                    <PrivateRoute>
                      <Applicants />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/recruiting/applicants/:id"
                  element={
                    <PrivateRoute>
                      <ApplicantDetails />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/user-management"
                  element={
                    <AdminRoute>
                      <UserManagement />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/stage-management"
                  element={
                    <AdminRoute>
                      <StageManagement />
                    </AdminRoute>
                  }
                />
                    <Route
                  path="/award-type-management"
                  element={
                    <AdminRoute>
                       <AwardTypeManagement admin type = "award-type"/>
                    </AdminRoute>
                  }
                />
                       <Route
                  path="/snapshot"
                  element={
                    <PrivateRoute>
                      <RecruitingGrid />
                    </PrivateRoute>
                  }
                  />
                  <Route
                  path="/activity-management"
                  element={
                    <AdminRoute>
                       <ActivityManagement admin type = "activity-type"/>
                    </AdminRoute>
                  }
                 />
                    <Route
                  path="/location-management"
                  element={
                    <AdminRoute>
                      <LocationManagement/>
                      </AdminRoute>
                  }
                  />

                <Route path="/login" element={<Login />} />
              </Routes>
            </BrowserRouter>
          </div>
          </FilterProvider>
        </AuthContextProvider>
      </CompanyContextProvider>
    </ThemeProvider>
  );
}
export default App;
