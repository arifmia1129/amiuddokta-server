// Define the type for the user object
export interface User {
  name: string;
  role: "super_admin" | "admin";
  profile_image?: string;
  about?: string;
  email: string;
  contact?: string;
  created_at: string;
  last_login: string;
  status: "active" | "inactive";
}

// Define the type for the response from getCurrentUser
export interface GetCurrentUserResponse {
  success: boolean;
  data: User;
}
