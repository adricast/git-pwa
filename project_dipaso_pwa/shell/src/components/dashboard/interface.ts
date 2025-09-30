// src/types.ts
import React from "react";

export interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode; // ✅ en vez de JSX.Element
}

export interface Branch {
  id: string;
  name: string;
}