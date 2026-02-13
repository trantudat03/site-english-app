export type MediaAsset = {
  id: number;
  name?: string;
  url: string;
};
export type Profile = {
  id: number;
  username: string;
  email?: string;
  avatar?: MediaAsset | null;
};  
