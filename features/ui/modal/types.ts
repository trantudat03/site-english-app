import { ReactNode } from "react";
import { PixelPopupProps } from "../PixelPopup";

export type ModalOpenProps = {
  description?: ReactNode;
  [key: string]: any;
};

export type GlobalModalRef<T = any> = {
  open: (props?: ModalOpenProps) => Promise<T>;
  close: (result?: T) => void;
};

export type GlobalModalProps = PixelPopupProps & {
  description?: ReactNode;
};
