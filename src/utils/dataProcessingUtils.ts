

// This file re-exports functions from more specialized utility files
// This approach maintains backward compatibility while improving code organization

export { parseOrderDate, getUniqueMonths } from './dateUtils';
export { 
  cleanVATNumber, 
  parseCommaNumber, 
  normalizeText,
  isCompanyRelatedColumn,
  isVATNumberRelatedColumn,
  isActualCompanyNameColumn,
  isPersonNameColumn
} from './formatUtils';
export { getUniqueCompanies, filterData } from './filterUtils';
export { calculateStats, consolidateIntracomData } from './statsUtils';

