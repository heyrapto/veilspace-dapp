"use client";

// ============================================================================
// Type Definitions
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: unknown[];

  constructor(statusCode: number, message: string, errors?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "ApiError";
  }
}

// User Types
export interface User {
  id: string;
  walletAddress: string;
  handle?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthRequest {
  walletAddress: string;
}

export interface UpdateProfileRequest {
  walletAddress: string;
  handle?: string;
  avatar?: string;
  bio?: string;
}

// Category Types
export interface Category {
  id: string;
  slug: string;
  title: string;
  description?: string;
  orderIndex: number;
  typeScope: ("global" | "market" | "fundraiser")[];
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  slug: string;
  title: string;
  description?: string;
  orderIndex?: number;
  typeScope: ("global" | "market" | "fundraiser")[];
  parentId?: string | null;
}

export interface UpdateCategoryRequest {
  title?: string;
  description?: string;
  orderIndex?: number;
  typeScope?: ("global" | "market" | "fundraiser")[];
  parentId?: string | null;
}

// Market Types
export interface Media {
  url: string;
  type: "image" | "video";
  order: number;
}

export interface MarketItem {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  media: Media[];
  tags: string[];
  stock: number;
  status: "active" | "sold_out" | "inactive";
  views: number;
  createdAt: string;
  updatedAt: string;
  seller?: User;
  category?: Category;
}

export interface MarketListParams {
  category?: string;
  sort?: "trending" | "new" | "price_asc" | "price_desc";
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface MarketListResponse {
  items: MarketItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateMarketItemRequest {
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  media: Media[];
  tags?: string[];
  stock?: number;
}

export interface UpdateMarketItemRequest {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  media?: Media[];
  tags?: string[];
  stock?: number;
  status?: "active" | "sold_out" | "inactive";
}

export interface PurchaseRequest {
  buyerId: string;
  quantity?: number;
}

export interface Purchase {
  id: string;
  marketItemId: string;
  buyerId: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  createdAt: string;
}

// Fundraiser Types
export interface Fundraiser {
  id: string;
  ownerId: string;
  categoryId: string;
  title: string;
  summary: string;
  description: string;
  goal: number;
  raised: number;
  deadlineAt: string;
  media: Media[];
  tags: string[];
  status: "active" | "completed" | "cancelled";
  views: number;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  category?: Category;
}

export interface FundraiserListParams {
  category?: string;
  sort?: "trending" | "ending_soon" | "raised" | "new";
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface FundraiserListResponse {
  items: Fundraiser[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateFundraiserRequest {
  ownerId: string;
  categoryId: string;
  title: string;
  summary: string;
  description: string;
  goal: number;
  deadlineAt: string;
  media: Media[];
  tags?: string[];
}

export interface UpdateFundraiserRequest {
  title?: string;
  summary?: string;
  description?: string;
  goal?: number;
  deadlineAt?: string;
  media?: Media[];
  tags?: string[];
  status?: "active" | "completed" | "cancelled";
}

export interface DonateRequest {
  donorId: string;
  amount: number;
  message?: string;
  anonymous?: boolean;
}

export interface Donation {
  id: string;
  fundraiserId: string;
  donorId: string;
  amount: number;
  message?: string;
  anonymous: boolean;
  createdAt: string;
  donor?: User;
}

export interface DonationsResponse {
  donations: Donation[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Search Types
export type SearchType = "all" | "market" | "fundraiser";

export interface SearchParams {
  q: string;
  type?: SearchType;
  category?: string;
  limit?: number;
}

export interface SearchResult {
  market?: MarketItem[];
  fundraisers?: Fundraiser[];
  total: number;
}

// Leaderboard Types
export type LeaderboardScope = "market_sales" | "fundraiser_raised" | "top_donors";
export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "all_time";

export interface LeaderboardEntry {
  userId: string;
  user?: User;
  rank: number;
  value: number;
  count?: number;
}

export interface LeaderboardParams {
  scope: LeaderboardScope;
  period?: LeaderboardPeriod;
  limit?: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  period: LeaderboardPeriod;
  scope: LeaderboardScope;
  updatedAt: string;
}

// ============================================================================
// API Client
// ============================================================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.message || "An error occurred",
          data.errors
        );
      }

      return data as ApiResponse<T>;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, error instanceof Error ? error.message : "Network error");
    }
  }

  // ========================================================================
  // Health Check
  // ========================================================================
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request("/health");
  }

  // ========================================================================
  // User Endpoints
  // ========================================================================
  async auth(walletAddress: string): Promise<ApiResponse<User>> {
    return this.request("/api/users/auth", {
      method: "POST",
      body: JSON.stringify({ walletAddress }),
    });
  }

  async getMe(wallet: string): Promise<ApiResponse<User>> {
    return this.request(`/api/users/me?wallet=${encodeURIComponent(wallet)}`);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    return this.request("/api/users/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // ========================================================================
  // Search Endpoints
  // ========================================================================
  async search(params: SearchParams): Promise<ApiResponse<SearchResult>> {
    const queryParams = new URLSearchParams({
      q: params.q,
      ...(params.type && { type: params.type }),
      ...(params.category && { category: params.category }),
      ...(params.limit && { limit: params.limit.toString() }),
    });

    return this.request(`/api/search?${queryParams.toString()}`);
  }

  // ========================================================================
  // Category Endpoints
  // ========================================================================
  async getCategories(scope?: "global" | "market" | "fundraiser"): Promise<ApiResponse<Category[]>> {
    const query = scope ? `?scope=${scope}` : "";
    return this.request(`/api/categories${query}`);
  }

  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    return this.request(`/api/categories/${slug}`);
  }

  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    return this.request("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    return this.request(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    return this.request(`/api/categories/${id}`, {
      method: "DELETE",
    });
  }

  // ========================================================================
  // Market Endpoints
  // ========================================================================
  async getMarketItems(params?: MarketListParams): Promise<ApiResponse<MarketListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return this.request(`/api/market${query ? `?${query}` : ""}`);
  }

  async getMarketItemById(id: string): Promise<ApiResponse<MarketItem>> {
    return this.request(`/api/market/${id}`);
  }

  async createMarketItem(data: CreateMarketItemRequest): Promise<ApiResponse<MarketItem>> {
    return this.request("/api/market", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMarketItem(id: string, data: UpdateMarketItemRequest): Promise<ApiResponse<MarketItem>> {
    return this.request(`/api/market/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteMarketItem(id: string): Promise<ApiResponse<null>> {
    return this.request(`/api/market/${id}`, {
      method: "DELETE",
    });
  }

  async purchaseMarketItem(id: string, data: PurchaseRequest): Promise<ApiResponse<Purchase>> {
    return this.request(`/api/market/${id}/purchase`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ========================================================================
  // Fundraiser Endpoints
  // ========================================================================
  async getFundraisers(params?: FundraiserListParams): Promise<ApiResponse<FundraiserListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return this.request(`/api/fundraisers${query ? `?${query}` : ""}`);
  }

  async getFundraiserById(id: string): Promise<ApiResponse<Fundraiser>> {
    return this.request(`/api/fundraisers/${id}`);
  }

  async createFundraiser(data: CreateFundraiserRequest): Promise<ApiResponse<Fundraiser>> {
    return this.request("/api/fundraisers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFundraiser(id: string, data: UpdateFundraiserRequest): Promise<ApiResponse<Fundraiser>> {
    return this.request(`/api/fundraisers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteFundraiser(id: string): Promise<ApiResponse<null>> {
    return this.request(`/api/fundraisers/${id}`, {
      method: "DELETE",
    });
  }

  async donateToFundraiser(id: string, data: DonateRequest): Promise<ApiResponse<Donation>> {
    return this.request(`/api/fundraisers/${id}/donate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getFundraiserDonations(
    id: string,
    page?: number,
    pageSize?: number
  ): Promise<ApiResponse<DonationsResponse>> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append("page", page.toString());
    if (pageSize) queryParams.append("pageSize", pageSize.toString());

    const query = queryParams.toString();
    return this.request(`/api/fundraisers/${id}/donations${query ? `?${query}` : ""}`);
  }

  // ========================================================================
  // Leaderboard Endpoints
  // ========================================================================
  async getLeaderboard(params: LeaderboardParams): Promise<ApiResponse<LeaderboardResponse>> {
    const queryParams = new URLSearchParams({
      scope: params.scope,
      ...(params.period && { period: params.period }),
      ...(params.limit && { limit: params.limit.toString() }),
    });

    return this.request(`/api/leaderboard?${queryParams.toString()}`);
  }

  async updateLeaderboards(): Promise<ApiResponse<null>> {
    return this.request("/api/leaderboard/update", {
      method: "POST",
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export default for convenience
export default apiClient;

