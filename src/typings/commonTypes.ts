import { BooleanLocale } from "yup/lib/locale";

export interface ModalProps {
  closeHandler: () => void;
  closeSelectionModal?: () => void;
  selected?: any;
  showType?: string;
  data?: any;
  addActivity?: (item: any) => void;
  options?: any;
  batchAdd?: boolean;
  renderButtons?: boolean;
  setVals?: (value: any) => void;
  vals?: any;
  activeStep?: number;
  steps?: any;
  handleNext?: () => void
  handleBack?: () => void
  prefill?: any
  submitTemplate?: (item:any) => void
  setFormValue?: (fieldName: any, value: any) => void
  state?: any;
  formValues?:any;
  yearInTheFuture?:any;
}

export interface SectionProps {
  filter: any;
  id?: string;
  type?: string;
  data?: any;
  showType?: string;
  setActivities?: any;
  detail?:boolean;
  carePartner?:boolean;
}

export interface CarePlanningSectionProps {
  data: any;
  type: string;
}

export interface CarePlanningModalProps {
  closeHandler: () => void;
  selected?: any;
  showType: string;
  data: any;
}
