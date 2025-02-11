export interface PageRespone<DTO> {
  content: DTO[];
  number: number;
  totalPages: number;  // Changed from totalPage
  size: number;
  totalElements: number; // Add this field
}
