import React from 'react';
import type { IconType } from 'react-icons';

export const renderIcon = (
  Icon: IconType,
  props?: React.SVGProps<SVGSVGElement> & { size?: number }
): React.ReactNode => {
  return React.createElement(Icon as any, props);
};



