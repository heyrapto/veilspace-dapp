export class ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  statusCode: number;

  constructor(statusCode: number, data?: any, message?: string) {
    this.success = statusCode < 400;
    this.message = message || 'Success';
    this.data = data;
    this.statusCode = statusCode;
  }
}

export class ApiError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../../../utils/ApiResponse';
import { ApiError } from '../../../utils/ApiError';

const userService = new UserService();

export class UserController {
  // POST /api/users/auth - Get or create user by wallet
  async auth(req: Request, res: Response) {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      throw new ApiError(400, 'Wallet address is required');
    }

    const user = await userService.getOrCreateUser(walletAddress);
    res.json(new ApiResponse(200, user, 'User authenticated'));
  }

  // GET /api/users/me?wallet=xxx - Get current user
  async getMe(req: Request, res: Response) {
    const { wallet } = req.query;

    if (!wallet || typeof wallet !== 'string') {
      throw new ApiError(400, 'Wallet address is required');
    }

    const user = await userService.getUserByWallet(wallet);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json(new ApiResponse(200, user));
  }

  // PATCH /api/users/profile - Update user profile
  async updateProfile(req: Request, res: Response) {
    const { walletAddress, handle, avatar, bio } = req.body;

    if (!walletAddress) {
      throw new ApiError(400, 'Wallet address is required');
    }

    const user = await userService.updateProfile(walletAddress, {
      handle,
      avatar,
      bio,
    });

    res.json(new ApiResponse(200, user, 'Profile updated'));
  }
}

import { Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import { ApiResponse } from '../../../utils/ApiResponse';
import { ApiError } from '../../../utils/ApiError';

const searchService = new SearchService();

export class SearchController {
  // GET /api/search?q=...&type=all|market|fundraiser&category=slug&limit=50
  async search(req: Request, res: Response) {
    const { q, type, category, limit } = req.query;

    if (!q || typeof q !== 'string') {
      throw new ApiError(400, 'Search query is required');
    }

    const results = await searchService.search(q, {
      type: type as any,
      category: category as string,
      limit: limit ? parseInt(limit as string) : 50,
    });

    res.json(new ApiResponse(200, results));
  }
}

import { Request, Response } from 'express';
import { MarketService } from '../services/market.service';
import { ApiResponse } from '../../../utils/ApiResponse';
import { ApiError } from '../../../utils/ApiError';

const marketService = new MarketService();

export class MarketController {
  // GET /api/market?category=slug&sort=trending|new|price_asc&page=1&pageSize=24
  async getAll(req: Request, res: Response) {
    const { category, sort, page, pageSize, search } = req.query;

    const result = await marketService.getAll({
      category: category as string,
      sort: sort as string,
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 24,
      search: search as string,
    });

    res.json(new ApiResponse(200, result));
  }

  // GET /api/market/:id
  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const item = await marketService.getById(id);

    if (!item) {
      throw new ApiError(404, 'Market item not found');
    }

    // Increment view count
    await marketService.incrementView(id);

    res.json(new ApiResponse(200, item));
  }

  // POST /api/market
  async create(req: Request, res: Response) {
    const item = await marketService.create(req.body);
    res.json(new ApiResponse(201, item, 'Market item created'));
  }

  // PATCH /api/market/:id
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const item = await marketService.update(id, req.body);
    res.json(new ApiResponse(200, item, 'Market item updated'));
  }

  // DELETE /api/market/:id
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await marketService.delete(id);
    res.json(new ApiResponse(200, null, 'Market item deleted'));
  }

  // POST /api/market/:id/purchase
  async purchase(req: Request, res: Response) {
    const { id } = req.params;
    const { buyerId, quantity = 1 } = req.body;

    if (!buyerId) {
      throw new ApiError(400, 'Buyer ID is required');
    }

    const purchase = await marketService.purchaseItem({
      marketItemId: id,
      buyerId,
      quantity,
    });

    res.json(new ApiResponse(200, purchase, 'Purchase completed'));
  }
}

import { Request, Response } from 'express';
import { LeaderboardService } from '../services/leaderboard.service';
import { ApiResponse } from '../../../utils/ApiResponse';
import { ApiError } from '../../../utils/ApiError';

const leaderboardService = new LeaderboardService();

export class LeaderboardController {
  // GET /api/leaderboard?scope=market_sales|fundraiser_raised|top_donors&period=daily|weekly|all_time
  async get(req: Request, res: Response) {
    const { scope, period = 'all_time', limit } = req.query;

    if (!scope) {
      throw new ApiError(400, 'Scope is required');
    }

    const validScopes = ['market_sales', 'fundraiser_raised', 'top_donors'];
    if (!validScopes.includes(scope as string)) {
      throw new ApiError(400, `Invalid scope. Must be one of: ${validScopes.join(', ')}`);
    }

    const leaderboard = await leaderboardService.getLeaderboard(
      scope as string,
      period as string,
      limit ? parseInt(limit as string) : 100
    );

    res.json(new ApiResponse(200, leaderboard));
  }

  // POST /api/leaderboard/update (Admin endpoint to manually trigger update)
  async update(req: Request, res: Response) {
    await leaderboardService.updateLeaderboards();
    res.json(new ApiResponse(200, null, 'Leaderboards updated'));
  }
}

import { Request, Response } from 'express';
import { FundraiserService } from '../services/fundraiser.service';
import { ApiResponse } from '../../../utils/ApiResponse';
import { ApiError } from '../../../utils/ApiError';

const fundraiserService = new FundraiserService();

export class FundraiserController {
  // GET /api/fundraisers?category=slug&sort=trending|ending_soon|raised&page=1
  async getAll(req: Request, res: Response) {
    const { category, sort, page, pageSize, search } = req.query;

    const result = await fundraiserService.getAll({
      category: category as string,
      sort: sort as string,
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 24,
      search: search as string,
    });

    res.json(new ApiResponse(200, result));
  }

  // GET /api/fundraisers/:id
  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const fundraiser = await fundraiserService.getById(id);

    if (!fundraiser) {
      throw new ApiError(404, 'Fundraiser not found');
    }

    // Increment view count
    await fundraiserService.incrementView(id);

    res.json(new ApiResponse(200, fundraiser));
  }

  // POST /api/fundraisers
  async create(req: Request, res: Response) {
    const fundraiser = await fundraiserService.create(req.body);
    res.json(new ApiResponse(201, fundraiser, 'Fundraiser created'));
  }

  // PATCH /api/fundraisers/:id
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const fundraiser = await fundraiserService.update(id, req.body);
    res.json(new ApiResponse(200, fundraiser, 'Fundraiser updated'));
  }

  // DELETE /api/fundraisers/:id
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await fundraiserService.delete(id);
    res.json(new ApiResponse(200, null, 'Fundraiser deleted'));
  }

  // POST /api/fundraisers/:id/donate
  async donate(req: Request, res: Response) {
    const { id } = req.params;
    const { donorId, amount, message, anonymous } = req.body;

    if (!donorId) {
      throw new ApiError(400, 'Donor ID is required');
    }

    if (!amount || amount <= 0) {
      throw new ApiError(400, 'Valid donation amount is required');
    }

    const donation = await fundraiserService.donate({
      fundraiserId: id,
      donorId,
      amount,
      message,
      anonymous,
    });

    res.json(new ApiResponse(200, donation, 'Donation completed'));
  }

  // GET /api/fundraisers/:id/donations
  async getDonations(req: Request, res: Response) {
    const { id } = req.params;
    const { page, pageSize } = req.query;

    const result = await fundraiserService.getDonations(
      id,
      page ? parseInt(page as string) : 1,
      pageSize ? parseInt(pageSize as string) : 20
    );

    res.json(new ApiResponse(200, result));
  }
}

# Prisma Schema (in the backend, i found this.. just incase you need it for to ensure 100% correct reponse is shown on the UI, you can make corrections where needed)

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// CORE MODELS
// ============================================================================

model User {
  id            String   @id @default(uuid())
  walletAddress String   @unique @map("wallet_address") // Solana wallet public key
  handle        String?  @unique // Optional username/display name
  avatar        String?
  bio           String?
  roles         String[] @default(["user"])
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // Relations
  marketItems MarketItem[]          @relation("SellerItems")
  purchases   Purchase[]            @relation("BuyerPurchases")
  fundraisers Fundraiser[]          @relation("OwnerFundraisers")
  donations   FundraiserDonation[]  @relation("DonorDonations")
  metrics     Metric[]

  @@map("users")
}

// ============================================================================
// CATEGORY SYSTEM (Unified for Market & Fundraisers)
// ============================================================================

model Category {
  id          String       @id @default(uuid())
  slug        String       @unique
  title       String
  description String?
  orderIndex  Int          @default(0) @map("order_index")
  typeScope   String[]     @default(["global"]) @map("type_scope") // ['global', 'market', 'fundraiser']
  parentId    String?      @map("parent_id")
  parent      Category?    @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    Category[]   @relation("CategoryHierarchy")
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  // Relations
  marketItems MarketItem[]
  fundraisers Fundraiser[]

  @@index([typeScope])
  @@index([orderIndex])
  @@map("categories")
}

// ============================================================================
// MARKET MODULE
// ============================================================================

model MarketItem {
  id            String     @id @default(uuid())
  sellerId      String     @map("seller_id")
  seller        User       @relation("SellerItems", fields: [sellerId], references: [id], onDelete: Cascade)
  categoryId    String     @map("category_id")
  category      Category   @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  title         String
  description   String
  price         Float
  currency      String     @default("USD")
  media         Json[]     @default([]) // [{url, type, order}]
  tags          String[]   @default([])

  stock         Int        @default(0)
  status        String     @default("active") // active, sold_out, inactive

  views         Int        @default(0)
  likes         Int        @default(0)

  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")

  // Relations
  purchases     Purchase[]

  @@index([categoryId])
  @@index([sellerId])
  @@index([status])
  @@index([createdAt])
  @@map("market_items")
}

model Purchase {
  id                String     @id @default(uuid())
  marketItemId      String     @map("market_item_id")
  marketItem        MarketItem @relation(fields: [marketItemId], references: [id], onDelete: Cascade)
  buyerId           String     @map("buyer_id")
  buyer             User       @relation("BuyerPurchases", fields: [buyerId], references: [id], onDelete: Cascade)

  amount      Float
  quantity    Int        @default(1)
  status      String     @default("pending") // pending, completed, failed

  createdAt         DateTime   @default(now()) @map("created_at")
  updatedAt         DateTime   @updatedAt @map("updated_at")

  @@index([marketItemId])
  @@index([buyerId])
  @@index([status])
  @@map("purchases")
}

// ============================================================================
// FUNDRAISER MODULE
// ============================================================================

model Fundraiser {
  id                String               @id @default(uuid())
  ownerId           String               @map("owner_id")
  owner             User                 @relation("OwnerFundraisers", fields: [ownerId], references: [id], onDelete: Cascade)
  categoryId        String               @map("category_id")
  category          Category             @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  title       String
  summary     String
  description String?
  goal        Float
  deadlineAt  DateTime? @map("deadline_at")

  media             Json[]               @default([]) // [{url, type, order}]
  tags              String[]             @default([])

  status          String @default("active") // active, completed, cancelled
  updatesCount    Int    @default(0) @map("updates_count")
  supportersCount Int    @default(0) @map("supporters_count")
  totalRaised     Float  @default(0) @map("total_raised")

  views             Int                  @default(0)
  likes             Int                  @default(0)

  createdAt         DateTime             @default(now()) @map("created_at")
  updatedAt         DateTime             @updatedAt @map("updated_at")

  // Relations
  donations         FundraiserDonation[]

  @@index([categoryId])
  @@index([ownerId])
  @@index([status])
  @@index([deadlineAt])
  @@index([createdAt])
  @@map("fundraisers")
}

model FundraiserDonation {
  id            String     @id @default(uuid())
  fundraiserId  String     @map("fundraiser_id")
  fundraiser    Fundraiser @relation(fields: [fundraiserId], references: [id], onDelete: Cascade)
  donorId       String     @map("donor_id")
  donor         User       @relation("DonorDonations", fields: [donorId], references: [id], onDelete: Cascade)

  amount    Float
  message   String?
  anonymous Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  @@index([fundraiserId])
  @@index([donorId])
  @@map("fundraiser_donations")
}

// ============================================================================
// LEADERBOARD MODULE
// ============================================================================

model LeaderboardSnapshot {
  id          String   @id @default(uuid())
  scope       String   // 'market_sales', 'fundraiser_raised', 'top_donors'
  period      String   // 'daily', 'weekly', 'monthly', 'all_time'
  entityId    String   @map("entity_id") // user_id or item_id depending on scope
  entityType  String   @map("entity_type") // 'user', 'market_item', 'fundraiser'
  metricValue Float    @map("metric_value")
  rank        Int?
  capturedAt  DateTime @default(now()) @map("captured_at")

  @@unique([scope, period, entityId, capturedAt])
  @@index([scope, period, rank])
  @@index([capturedAt])
  @@map("leaderboard_snapshots")
}

// ============================================================================
// METRICS & ANALYTICS
// ============================================================================

model Metric {
  id            String     @id @default(uuid())
  eventType     String     @map("event_type") // 'view', 'click', 'purchase', 'donation', 'like'
  entityType    String     @map("entity_type") // 'market_item', 'fundraiser'
  entityId      String     @map("entity_id")
  userId        String?    @map("user_id")
  user          User?      @relation(fields: [userId], references: [id], onDelete: SetNull)

  metadata      Json?
  ipAddress     String?    @map("ip_address")
  userAgent     String?    @map("user_agent")

  createdAt     DateTime   @default(now()) @map("created_at")

  @@index([eventType, entityType, entityId])
  @@index([userId])
  @@index([createdAt])
  @@map("metrics")
}

// ============================================================================
// SETTINGS
// ============================================================================

model SystemSetting {
  id          String   @id @default(uuid())
  key         String   @unique
  value       String
  valueType   String   @default("string") @map("value_type") // 'string', 'number', 'boolean', 'json'
  description String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("system_settings")
}
