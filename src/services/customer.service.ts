import { apiClient } from "@/lib/api-client";
import { BEE_LEVEL_THRESHOLDS } from "@/lib/utils";
import type { Address, BeeLevel, Customer } from "@/types";

export type CustomerStatus = "Active" | "Banned";

export interface ApiCustomerAddress {
  _id?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  full_name?: string;
  createdAt?: string;
}

export interface ApiCustomer {
  _id: string;
  name: string;
  email: string;
  phone?: string | null;
  img?: string | null;
  role: string;
  block: boolean;
  is_verified: boolean;
  is_identity_verified?: boolean;
  use_type?: string;
  provider?: string;
  totalOrders?: number;
  totalSpend?: number;
  lastOrderAt?: string | null;
  addressCount?: number;
  addresses?: ApiCustomerAddress[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerListResponse {
  success?: boolean;
  message: string;
  data: ApiCustomer[];
  total?: number;
}

export interface CustomerFilters {
  search?: string;
  status?: CustomerStatus;
}

const LEVELS_DESC: BeeLevel[] = ["Royal", "Queen", "Drone", "Worker", "Larva"];

function beeLevelFromOrders(totalOrders: number): BeeLevel {
  return LEVELS_DESC.find((level) => totalOrders >= BEE_LEVEL_THRESHOLDS[level]) ?? "Larva";
}

function mapAddress(address: ApiCustomerAddress): Address {
  return {
    line1: address.address ?? "No street address",
    line2: address.zip ? `ZIP ${address.zip}` : undefined,
    area: address.state ?? "Not available",
    city: address.city ?? "Not available",
    zone: "Rest of BD",
    phone: address.phone ?? "",
  };
}

export function mapApiCustomerToCustomer(customer: ApiCustomer): Customer {
  const totalOrders = customer.totalOrders ?? 0;
  const totalSpend = customer.totalSpend ?? 0;

  return {
    id: customer._id,
    name: customer.name || "Unnamed customer",
    email: customer.email || "No email",
    phone: customer.phone ?? "",
    beeLevel: beeLevelFromOrders(totalOrders),
    totalOrders,
    totalSpend,
    addresses: (customer.addresses ?? []).map(mapAddress),
    wardrobeItems: 0,
    joinedAt: customer.createdAt ?? "",
    lastActive: customer.lastOrderAt ?? customer.updatedAt ?? customer.createdAt ?? "",
    status: customer.block ? "Banned" : "Active",
    loyaltyPoints: Math.floor(totalSpend / 100),
    loginHistory: [],
  };
}

export const customerService = {
  getAll: async (filters?: CustomerFilters): Promise<CustomerListResponse> => {
    const { data } = await apiClient.get<CustomerListResponse>("/auth/get-all-users", {
      params: filters,
    });
    return data;
  },

  toggleBlock: async (id: string): Promise<{ message: string; data?: ApiCustomer }> => {
    const { data } = await apiClient.patch(`/auth/block/${id}`);
    return data;
  },
};
