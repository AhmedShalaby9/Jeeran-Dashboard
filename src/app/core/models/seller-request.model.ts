// MODEL — defines the shape of seller-request data

export type SellerRequestStatus = 'pending' | 'approved' | 'rejected';

export interface SellerRequest {
  id:         number;
  user_id:    number;
  status:     SellerRequestStatus;
  notes?:     string | null;
  user?: {
    id:     number;
    name:   string;
    email:  string;
    phone?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SellerRequestListResponse {
  success:     boolean;
  data:        SellerRequest[];
  pagination?: {
    page:  number;
    limit: number;
    total: number;
    pages: number;
  };
  total?: number;
}

export interface SellerRequestResponse {
  success: boolean;
  data:    SellerRequest;
}
