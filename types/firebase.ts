// types/firebase.d.ts
export interface RegisterFormValues {
  displayName?: string;
  email: string;
  password: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  createdAt?: any; 
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName?: string | null;
  recipientId: string;
  createdAt?: any;
}
