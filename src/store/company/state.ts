export interface CompanyStateI {
  locations: any[];
  users: any[];
  clients: any[];
  carePartners: any[];
  careManagerActivities: any[];
}

const companyInitialState: CompanyStateI = {
  locations: [],
  users: [],
  clients: [],
  carePartners: [],
  careManagerActivities: [],
};

export { companyInitialState };
