// /models/api/IDocument.ts

export interface IPersonDocument {
  person_document_id: string;
  doc_type_id: string;
  doc_number: string;
  person_id: string;
  issuing_country: string;
  expiration_date: string; // Se recomienda usar 'string' para fechas ISO 8601
  integration_code: string;
  is_active: boolean;
  created_by_user_id: string;
}