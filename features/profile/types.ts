import { MediaAsset } from "../lesson";

export type Profile = {
  id: number;
  username: string;
  email?: string;
  avatar?: MediaAsset | null;
};  
