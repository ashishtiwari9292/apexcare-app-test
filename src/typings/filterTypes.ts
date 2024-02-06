export type QuickHitsFilter =
  | {
      flag: boolean;
      location: Value;
      careManager: Value;
      status: Value;
      startDate: Value;
      endDate: Value;
    }
  | {};

type Value = {
  id: string;
  value: String;
};

export type ApplicantsFilter =
  | {
      location: Value;
      status: Value;
      dateRange: Value;
      startDate: Value;
      endDate: Value;
    }
  | {};

  export type  CareManagerFilter = 
  |{
    careManager:Value;
    dateRange:Value;
    location:Value;
    activity:Value;
    groupBy?:Value
  
  }
  |{};