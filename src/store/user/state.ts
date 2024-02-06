export interface UserStateI {
  user: any;
  isLoggedIn: boolean;
}

const userInitialState: UserStateI = {
  user: null,
  isLoggedIn: false,
};

export { userInitialState };
