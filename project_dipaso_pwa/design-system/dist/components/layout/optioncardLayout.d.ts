import React from "react";
interface OptionCardProps {
    label: string;
    icon: React.ReactNode;
    color?: string;
    hoverColor?: string;
    textColor?: string;
    iconColor?: string;
    size?: number;
    onClick?: () => void;
    disabled?: boolean;
}
declare const OptionCard: React.FC<OptionCardProps>;
export default OptionCard;
