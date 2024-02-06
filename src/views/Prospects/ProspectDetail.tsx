import { Card, Layout } from 'components';
import React, { useState, useEffect, createContext } from 'react'
import { useParams } from 'react-router-dom';
import API from 'services/AxiosConfig';
import ProspectContacts from './ProspectContacts';
import ProspectsModal from './ProspectsModal'
import { ProspectTabs } from './ProspectTabs'
export const DataContext = createContext({});


function ProspectDetail() {
    const [prospect, setProspect] = useState<any>({})
    const [activityTabs, setActivityTabs] = useState([])
    const { prospectId } = useParams();
    const [shouldRefetch, setShouldRefetch] = useState([false,false]);

    const handleRefetch = (idx: number): void => {
      setShouldRefetch(prevState => {
        const newState = [...prevState];
        newState[idx] = true;
        return newState;
      });
    };
  
    const handleRefetchComplete = (idx: number): void => {
      setShouldRefetch(prevState => {
        const newState = [...prevState];
        newState[idx] = false;
        return newState;
      });
    };

    const getUniquePrefixes = (arr:any) => {
      const prefixes = new Set();
      arr.forEach((str:string)=>{
        if(str){
        const prefix = str.split(':')[0].trim()
        prefixes.add(prefix)
        }
      })
      return Array.from(prefixes);
    }
    
    const fetchActivityTabs = async () => {
        API.get(`/marketing/types`)
          .then((rsp: any) => {
            const formattedTabs:any = getUniquePrefixes(rsp.data.data.map((item: any) => item.type))
        setActivityTabs(formattedTabs)
         
          })
          .catch((error: any) => {
            console.error(error);
          });
      }

    const fetchProspectData = async () => {
        try {
            const prospect = await API.get(`/prospects/prospect/${prospectId}`)
            setProspect(prospect.data)
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
     fetchProspectData()
     fetchActivityTabs()
    }, [])

    return (
        <Layout>
              <Card style = {{ paddingTop: 20 }}>
            <ProspectsModal detail={true} currentRow = {prospect} fetchProspectData={fetchProspectData}/>
            </Card>
            <ProspectContacts prospectId={prospectId}/>
            <DataContext.Provider value={{ shouldRefetch, handleRefetch, handleRefetchComplete }}>
            <ProspectTabs tabs={[ 'Tasks', 'Internal Note']} title='Prospect Task and Notes' defaultType='Tasks' />
            <ProspectTabs tabs={['All Activities', ...activityTabs]} defaultType='All Activities' title='Prospect Activity' />
            </DataContext.Provider>
        </Layout>
    )
}

export default ProspectDetail


