"use client";

import React, { createContext, useContext } from "react";
import { User } from "firebase/auth";
import { AdminRole } from "./rbac";

export interface AdminContextType {
  user: User | null;
  role: AdminRole | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

export const AdminContext = createContext<AdminContextType>({
  user: null,
  role: null,
  isSuperAdmin: false,
  isAdmin: false,
});

export const useAdmin = () => useContext(AdminContext);
