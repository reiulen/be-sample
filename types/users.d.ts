type TUserCreateRequest = {
  email: string;
  password: string;
  password_confirm: string;
  fullname: string;
};

type TUserResponse = {
  id: number;
  email: string;
  fullname: string;
  token: string;
};
