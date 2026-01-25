// components/shared/index.js
// Central export file for all shared components

// Form Components
export { default as FormInput } from "./FormInput";
export { default as FormSelect } from "./FormSelect";
export { default as FormCheckbox } from "./FormCheckbox";
export { default as FormTextarea } from "./FormTextarea";

// UI Components
export { default as Button } from "./Button";
export { default as Card } from "./Card";
export { default as Badge } from "./Badge";
export { default as StatusIndicator } from "./StatusIndicator";
export { default as ProgressBar } from "./ProgressBar";
export { default as EmptyState } from "./EmptyState";
export { default as ListItem } from "./ListItem";
export { default as SectionHeader } from "./SectionHeader";
export { default as PageContainer } from "./PageContainer";
export { default as Modal } from "./Modal";
export { default as ActionButtons } from "./ActionButton";

// Table Components
export {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "./Table";

// Feature Components
export { default as MediaPicker } from "./MediaPicker";
export { default as DietaryTagsSelector } from "./DietaryTagSelector";

// Usage example:
// import { FormInput, Button, Card, Table, MediaPicker } from './components/shared';
