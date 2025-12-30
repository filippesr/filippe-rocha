
import React from 'react';

export interface BenefitItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface SectionProps {
  children?: React.ReactNode;
  className?: string;
  id?: string;
}