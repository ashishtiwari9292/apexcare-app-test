export type AuthUser = {
  _id: string;
  decodedId: string;
  firstName: string;
  lastName: string;
  email: string;
  location: Location;
};

export type Location = {
  _id: string;
  location: string;
};
