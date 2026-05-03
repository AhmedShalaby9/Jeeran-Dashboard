// MODEL — chat sessions and messages

export interface ChatUser {
  id:           number;
  name:         string;
  phone:        string;
  email:        string;
  subscription: ChatSubscription | null;
}

export interface ChatSubscription {
  id:         number;
  user_id:    number;
  package_id: number;
  start_date: string;
  end_date:   string;
  status:     string;
}

export interface ChatSession {
  id:         number;
  user_id:    number;
  title:      string;
  created_at: string;
  updated_at: string;
  user:       ChatUser;
}

export interface ChatMessage {
  id:               number;
  session_id:       number;
  role:             'user' | 'assistant' | 'tool';
  content:          string | null;
  reasoning_content:string | null;
  tool_calls:       unknown | null;
  tool_call_id:     string | null;
  tokens_in:        number | null;
  tokens_out:       number | null;
  created_at:       string;
  updated_at:       string;
}

export interface Pagination {
  page:   number;
  limit:  number;
  total:  number;
  pages:  number;
  sort:   string;
  order:  string;
}

export interface ChatSessionsResponse {
  success:    boolean;
  pagination: Pagination;
  data:       ChatSession[];
}

export interface ChatMessagesResponse {
  success:    boolean;
  pagination: Pagination;
  data:       ChatMessage[];
}
