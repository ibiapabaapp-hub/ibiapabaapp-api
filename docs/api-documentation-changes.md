# API Documentation - Complete Changes Overview

## Overview

This document provides a comprehensive overview of all entities and endpoints that have changed during the migration to a unified account/profile model. This is a supplementary document to be merged with the main API documentation.

## Changed Entities and Endpoints

### 1. Favorites Module (`/api/v1/favorites`)

**Key Changes:**

- Changed from `profile_favorite` table to `account_favorite` table
- Updated all DTOs and entities to use `account_id` instead of `profile_id`
- Updated service method names to reflect account-based structure

**Updated Endpoints:**

#### POST /favorites

- **Request Body:** `CreateFavoriteDTO` now uses `account_id` field
- **Changes:** `profile_id` → `account_id`, `business_profile_id` → `business_id`

```typescript
// Before
{
  "profile_id": "uuid",
  "business_profile_id": "uuid"
}

// After
{
  "account_id": "uuid",
  "business_id": "uuid"
}
```

#### GET /favorites

- **Query Parameter:** `account_id` (optional) - Filter favorites by account
- **Changes:** Now supports filtering by `account_id` instead of `profile_id`

#### Service Methods Updated:

- `findByAccountAndCity()` - Uses `account_id` parameter
- `findByAccountAndEvent()` - Uses `account_id` parameter
- `findByAccountAndBusiness()` - Uses `account_id` parameter
- `removeByCity()`, `removeByEvent()`, `removeByBusiness()` - All use `account_id`

**Updated Entity:**

```typescript
export class Favorite implements account_favorite {
	id: string;
	account_id: string; // Changed from profile_id
	city_id: string | null;
	event_id: string | null;
	business_id: string; // Changed from business_profile_id
}
```

### 2. Medias Module (`/api/v1/media`)

**Key Changes:**

- Media entity now uses `account_id` instead of `profile_id`
- Updated service method to use account-based queries

**Updated Endpoints:**

#### Service Methods Updated:

- `getMediaByAccount(id: string)` - Renamed from `getMediaByBusiness`
- **Changes:** Now queries by `account_id` instead of `profile_id`

**Updated Entity:**

```typescript
export class Media {
	account_id: string | null; // Changed from profile_id
	id: string;
	city_id: string | null;
	event_id: string | null;
	media_type: $Enums.media_type;
	url: string;
	// ... other fields
}
```

### 3. Search Module (`/api/v1/search`)

**Key Changes:**

- Business search now queries through account relationship
- Updated select fields to use account-based data structure

**Updated Endpoints:**

#### GET /search

- **Response:** Business search now uses `account.display_name` instead of profile fields
- **Changes:** Query structure updated to use account relationship

```typescript
// Business search query
{
  account: {
    display_name: {
      contains: query,
      mode: 'insensitive'
    }
  }
}

// Select fields include account_id
{
  id: true,
  cnpj: true,
  account_id: true,  // Now included in response
  max_reach_level: true,
  created_at: true,
  updated_at: true
}
```

### 4. Businesses Module (`/api/v1/businesses`)

**Key Changes:**

- Business creation and management now uses `account_id` instead of `profile_id`
- Business responses include account data instead of profile data

**Updated Endpoints:**

#### POST /businesses

- **Request Body:** `CreateBusinessDTO` uses `account_id` field
- **Changes:** `profile_id` → `account_id`

```typescript
// Before
{
  "profile_id": "uuid",
  "cnpj": "123456789",
  // ... other fields
}

// After
{
  "account_id": "uuid",
  "cnpj": "123456789",
  // ... other fields
}
```

#### GET /businesses & GET /businesses/:id

- **Response:** Now includes account data structure
- **Changes:** Profile fields replaced with account fields

```typescript
// Response structure
{
  id: string,
  account_id: string,        // New field
  slug: string,              // From account.slug
  name: string,              // From account.display_name
  bio: string,               // From account.bio
  avatar_url: string,        // From account.avatar_url
  type: string,              // From account.type
  max_reach_level: string,
  cnpj: string,
  categories: string[],
  created_at: Date
}
```

### 5. Events Module (`/api/v1/events`)

**Key Changes:**

- Event creation now uses `owner_account_id` instead of `owner_profile_id`
- Event responses include account data instead of profile data

**Updated Endpoints:**

#### POST /events

- **Request Body:** `CreateEventDTO` uses `owner_account_id` field
- **Changes:** `owner_profile_id` → `owner_account_id`

```typescript
// Before
{
  "owner_profile_id": "uuid",
  "name": "Event Name",
  // ... other fields
}

// After
{
  "owner_account_id": "uuid",
  "name": "Event Name",
  // ... other fields
}
```

#### GET /events & GET /events/:id

- **Response:** Now includes account data structure
- **Changes:** Owner profile fields replaced with account fields

```typescript
// Response structure includes
owner: {
  id: string,
  slug: string,              // From account.slug
  display_name: string,      // From account.display_name
  avatar_url: string,        // From account.avatar_url
  type: string               // From account.type
}
```

### 6. Auth Module (`/api/v1/auth`)

**Key Changes:**

- Registration now creates unified account with profile fields
- Login and token management remain unchanged
- User data responses include unified account structure

**Updated Endpoints:**

#### POST /auth/register

- **Request Body:** `RegisterDto` already includes profile fields (no changes needed)
- **Response:** Returns unified `SecureAccountDTO` with all account and profile fields

#### POST /auth/login

- **No changes:** Same functionality, returns unified account data

#### GET /auth/me

- **Response:** Returns unified `SecureAccountDTO` with all account and profile fields

### 7. Accounts Module (`/api/v1/accounts`)

**Key Changes:**

- Added profile management endpoints to accounts module
- Updated DTOs to include profile fields
- Added interests management functionality

**Updated Endpoints:**

#### GET /accounts

- **Response:** `SecureAccountDTO` now includes profile fields
- **Changes:** Added `slug`, `display_name`, `bio`, `avatar_url`, `type` fields

#### GET /accounts/:id

- **Response:** `SecureAccountDTO` now includes profile fields
- **Changes:** Added profile fields to response

#### PATCH /accounts/:id

- **Request Body:** `UpdateAccountDTO` now includes profile fields
- **Changes:** Can update both account and profile fields

```typescript
// New profile fields in UpdateAccountDTO
{
  name?: string;
  email?: string;
  password?: string;
  active?: boolean;
  // Profile fields
  slug?: string;              // New
  display_name?: string;      // New
  bio?: string;               // New
  avatar_url?: string;        // New
  type?: account_type;        // New
}
```

#### NEW: GET /accounts/:id/interests

- **Description:** Get account interests (moved from profiles module)
- **Response:** `AccountInterestsResult`

#### NEW: PATCH /accounts/:id/interests

- **Description:** Update account interests (moved from profiles module)
- **Request Body:** `UpdateInterestsDTO`
- **Response:** Updated interests count

### 8. Account Interests Module

**Key Changes:**

- Moved from profiles module to accounts module
- Updated to use `account_interest` table instead of `profile_interest`
- All functionality preserved with account-based structure

**Updated DTOs:**

#### UpdateInterestsDTO

```typescript
export class UpdateInterestsDTO {
	businesses?: string[]; // Business category IDs
	events?: string[]; // Event category IDs
}
```

**Service Methods:**

- `findAllByAccountId(accountId: string)` - Returns `AccountInterestsResult`
- `upsert(accountId: string, dto: UpdateInterestsDTO)` - Updates account interests

## Database Schema Changes Summary

### Removed Tables

- `profile`
- `account_profile`
- `profile_interest`
- `profile_favorite`

### Updated Tables

- `account`: Added profile fields (slug, display_name, bio, avatar_url, type)
- `business`: Changed `profile_id` to `account_id`
- `event`: Changed `owner_profile_id` to `owner_account_id`
- `media`: Changed `profile_id` to `account_id`

### New Tables

- `account_interest`: Replaces `profile_interest`
- `account_favorite`: Replaces `profile_favorite`

## Migration Impact

### Frontend Changes Required

- Update all API calls to use account-based endpoints
- Update data models to handle unified account structure
- Update forms to include profile fields in account management
- Update favorites functionality to use `account_id`
- Update media queries to use `account_id`

### Backend Changes Completed

- All profile-related functionality moved to accounts module
- Removed profiles module completely
- Updated all foreign key references
- Updated all DTOs and entities
- Updated service methods throughout the application

## Breaking Changes Summary

### Removed Endpoints

- All `/profiles/*` endpoints - Use `/accounts/*` instead

### Changed Request/Response Formats

- All endpoints that previously used `profile_id` now use `account_id`
- Business and event creation use `account_id`/`owner_account_id`
- Account responses include profile fields
- Favorites use `account_id` and `business_id`

### New Endpoints

- `GET /accounts/:id/interests`
- `PATCH /accounts/:id/interests`

## API Version

The API version has been updated to `2.0` to reflect these breaking changes.

## Testing Notes

All existing tests have been updated to use the new account-based structure. The migration maintains all existing functionality while simplifying the data model and API structure.
