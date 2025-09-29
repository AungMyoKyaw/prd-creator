import type React from 'react';

// Core data types for the PRD Creator application

export interface PRDInput {
  productName: string;
  targetAudience: string;
  problemStatement: string;
  proposedSolution: string;
  coreFeatures: string;
  businessGoals: string;
  futureFeatures: string;
  techStack: string;
  constraints: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GeneratePRDRequest {
  input: PRDInput;
}

export interface GeneratePRDResponse {
  prd: string;
}

export interface GenerateInputsRequest {
  idea: string;
}

export interface GenerateInputsResponse {
  input: PRDInput;
}

export interface RefineSection {
  sectionTitle: string;
  feedback: string;
  currentInputs: PRDInput;
}

export interface RefineSectionResponse {
  updatedInput: Partial<PRDInput>;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
}

// Component prop types
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
}

export interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
  error?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Form validation types
export interface ValidationError {
  field: keyof PRDInput;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
