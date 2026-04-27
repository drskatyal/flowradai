// Types for the sidebar data
interface User {
  name: string;
  email: string;
  avatar: string;
}

interface Team {
  name: string;
  logo: React.ElementType;
  plan: string;
}

interface BaseNavItem {
  title: string;
  badge?: string;
  icon?: React.ElementType;
}

type NavLink = BaseNavItem & {
  url: string;
  items?: never;
};

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: string })[];
  url?: never;
};

type NavItem = NavCollapsible | NavLink;

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarData {
  user: User;
  teams: Team[];
  navGroups: NavGroup[];
}

export type { NavCollapsible, NavGroup, NavItem, NavLink, SidebarData };

// type for pagination
export type Pagination = {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  totalPages: number;
  currentPage: number;
};

export interface StoreDetails {
  id: string;
  caseVolumeLTM?: number | null;
  caseVolume2024?: number | null;
  cirocCases?: number | null;
  percentile?: number | null;
  geoLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  notes?: {
    id: string;
  }[];
  isNoSales?: boolean;
  percentileCategory?: "gold" | "silver" | "bronze";
  salesCategory?: "green" | "yellow" | "red";
}

export interface GeoTargetStoreDetails {
  id?: string;
  percentileCategory: "gold" | "silver" | "bronze" | "gray";
  salesCategory: "green" | "yellow" | "red";
  notes?: {
    id: string;
  }[];
}

//TODO: Fix type to use types form the generated schema
export interface CustomerDetails {
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  createdAt?: string | null;
  geoLocation?: {
    __typename?: "Point";
    latitude: number;
    longitude: number;
    height?: number | null;
  } | null;
}

export interface VisitDetails {
  id?: string;
  date?: string;
}

export interface InfluencerDetails {
  id?: string;
  picture?: string | null;
}

// types for map
export interface StoreMapMarker {
  lat: number;
  lng: number;
  details?: StoreDetails;
}

export interface GeoTargetStoreMapMarker {
  lat: number;
  lng: number;
  details?: GeoTargetStoreDetails;
}
export interface CustomerMapMarker {
  lat: number;
  lng: number;
  details?: CustomerDetails;
}

export interface VisitMapMarker {
  lat: number;
  lng: number;
  details?: VisitDetails;
}

export interface InfluencerMapMarker {
  lat: number;
  lng: number;
  details?: InfluencerDetails;
}

export interface MapCoordinates {
  lat: number;
  lng: number;
  radius: number;
  zoom?: number;
}

// types for date range
export type DateRange = {
  from: string;
  to: string;
};

export interface CustomerClusterDetails {
  id: string;
  customerCount: number;
  geoLocation: {
    latitude: number;
    longitude: number;
  };
}


export interface ExtendedUserPublicMetadata extends UserPublicMetadata {
  internalId: string;
  user: { status: "active" | "inactive" | "onboarding"; referralCode: string, role: "user" | "admin" };
  thread?: { availableCredits: number; totalCredits: number };
  payment?: {
    paymentId?: string;
    paymentCreatedAt?: string;
    paymentType?: string;
    paymentAmount?: number;
    threadsQuantity?: number;
  };
  referralCode?: string;
  referral?: {
    code: string;
    by: string;
  };
}
