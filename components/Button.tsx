"use client";

import { Button as Btn } from "primereact/button";

interface ButtonProps {
  readonly text?: string;
  readonly className: string;
  readonly type?: "button" | "reset" | "submit";
  readonly state: boolean;
  readonly disabled?: boolean;
  readonly outlined?: boolean;
  readonly icon?: string;
  readonly id: string;
  readonly iconPos?: "top" | "bottom" | "left" | "right";
  readonly onClick?: () => void;
  readonly pt?: any;
}

export default function Button({
  text,
  className,
  type,
  state,
  disabled,
  id,
  onClick,
  icon,
  iconPos,
  outlined,
  pt,
}: ButtonProps) {
  return (
    <Btn
      className={`${className} text-xs xs:text-sm sm:text-base`}
      type={type}
      disabled={disabled}
      id={id}
      loading={!state}
      label={text}
      onClick={onClick}
      icon={icon}
      iconPos={iconPos}
      outlined={outlined}
      pt={pt}
    />
  );
}
