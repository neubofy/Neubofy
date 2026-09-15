"use client";

import React, { createContext, useContext } from "react";
import { User } from "firebase/auth";
import { AdminRole } from "./rbac";

export interface AdminContextType {
  user: User | null;
  role: AdminRole | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  communicationEmail?: string;
  updateCommunicationEmail?: (email: string) => Promise<boolean>;
}

export const AdminContext = createContext<AdminContextType>({
  user: null,
  role: null,
  isSuperAdmin: false,
  isAdmin: false,
  communicationEmail: "",
});

export const useAdmin = () => useContext(AdminContext);
