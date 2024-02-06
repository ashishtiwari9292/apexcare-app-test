import { useContext, createContext, useState, FC, useEffect } from 'react';
import { useAuth } from 'hooks';
export interface FilterStateI {
  flag: boolean;
  referralPartner: { id: string; value: string };
  companyName: { id: string; value: string };
  status: { id: string; value: string };
  companyType: { id: string; value: string };
  location: { id: string; value: string };
  groupBy: { id: string; value: string };
}

export interface ProspectFilterStateI {
    flag: boolean;
    prospect: { id: string; value: string };
    location: { id: string; value: string };
    status: { id: string; value: string };
    dateRange: { id: string; value: string };
    startDate: { id: string; value: string };
    endDate: { id: string; value: string };
    stage:{ id: string; value: string };
  }

interface Context {
    referralFilter: FilterStateI;
    prospectFilter:ProspectFilterStateI;
    updateFilter: (newFilter: Partial<FilterStateI>) => void;
    updateProspectFilter:(newFilter: Partial<ProspectFilterStateI>) => void; 
    resetProspectFilter: () => void;                
    resetFilter: () => void;
    toggleUpdateComponent: () => void,
    updateComponent:boolean,
  }

const initialFilterState: FilterStateI = {
  flag: false,
  referralPartner: { id: '', value: '' },
  companyName: { id: '', value: '' },
  status: { id: 'Active', value: 'Active' },
  companyType: { id: 'All', value: 'All' },
  location: { id: '', value: '' },
  groupBy: { id: 'None', value: 'None' },
};

const initialProspectFilterState: ProspectFilterStateI =   {
    flag: false,
    prospect:{id:'', value:''},
    location: { id: 'All', value: 'All' },
    status: { id: 'Open', value: 'Active' },
    dateRange: { id: 'All', value: 'All' },
    startDate: { id: '', value: '' },
    endDate: { id: '', value: '' },
    stage:{ id: 'All', value: 'All' },
}
export const FilterContext = createContext<Context | undefined>(undefined);

export const FilterProvider: FC = ({ children }) => {
const {user} = useAuth()
  const [filter, setFilter] = useState<FilterStateI>({...initialFilterState, location:{ id: user?.location?._id, value: user?.location?.value }});
  const [prospectFilter,setProspectFilter] = useState<ProspectFilterStateI>({...initialProspectFilterState, location:{ id: user?.location?._id, value: user?.location?.value }})
  const [updateComponent,setUpdateComponent] = useState(false)


  const updateFilter = (newFilter: Partial<FilterStateI>) => {
    setFilter(prevFilter => ({ ...prevFilter, ...newFilter }));
  };
  const toggleUpdateComponent = () => {
    setUpdateComponent(prev => !prev)
  }

  const resetFilter = () => {
    setFilter(initialFilterState);
  };
  const updateProspectFilter = (newFilter: Partial<ProspectFilterStateI>) => {
    setProspectFilter(prevFilter => ({ ...prevFilter, ...newFilter }));
  };

  const resetProspectFilter = () => {
    setProspectFilter(initialProspectFilterState);
  };

  useEffect(()=>{
    setFilter(prevFilter => ({ ...prevFilter, location:{ id: user?.location?._id, value: user?.location?.value } }));
  },[user])

  return (
    <FilterContext.Provider value={{ referralFilter: filter, prospectFilter, updateFilter, resetFilter , updateProspectFilter, resetProspectFilter,updateComponent,toggleUpdateComponent}}>
      {children}
    </FilterContext.Provider>
  );
};

export function useFilter() {
    const context = useContext(FilterContext);


    if (!context) {
        return {
            referralFilter:initialFilterState,
            prospectFilter:initialProspectFilterState,
            updateFilter: (newFilter: Partial<FilterStateI>) => {},
            updateProspectFilter: (newFilter: Partial<ProspectFilterStateI>) => {},
            resetFilter: () => {},
            resetProspectFilter: () => {},
            toggleUpdateComponent: () => {},
            updateComponent:false


        }
    }else{
        return context;
    }
  }