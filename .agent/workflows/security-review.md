---
description: 
---

# Comprehensive Security Audit & Threat Model
**Project:** Anose Beauty E-Commerce Platform (`anosebeauty.com`)  
**Stack:** Next.js 15 (App Router), Prisma ORM, Supabase (PostgreSQL), Razorpay & PhonePe  
**Reviewer Role:** Principal Security Architect  

## 1. Executive Summary
This document provides a comprehensive security review and threat modeling evaluation of the Anose Beauty production platform. Following a zero-trust architecture, defenses have been audited and hardened across authentication, payment cryptographic verification, client-side XSS mitigation, rate limiting, and secret management.

## 2. API & Backend Security (Next.js & Prisma)

### 2.1. Authentication & Session Management
*   **Session Security:** Enforced NextAuth JWT sessions with a 2-hour max age (`maxAge: 7200`) and secure HTTP cookies.
*   **Mobile API Tokens:** Secured mobile admin endpoints via `jose.jwtVerify` validating `HS256` signatures against `NEXTAUTH_SECRET`.
*   **Brute-Force & Abuse Mitigation:** [COMPLETED] Implemented a sliding-window rate limiting engine (`src/lib/rateLimit.ts`) with automatic IP extraction and TTL cleanup:
    - `/api/register`: 5 attempts per 15 minutes per IP.
    - `/api/orders`: 15 creation attempts per 10 minutes per IP.
    - `/api/payment/initiate`: 15 attempts per 10 minutes per IP.
    - `/api/contact`: 6 inquiries per 10 minutes per IP.
    - `/api/collab`: 5 applications per 10 minutes per IP.
    - `/api/newsletter`: 5 subscriptions per 10 minutes per IP.
    - `/api/reviews`: 5 reviews per 10 minutes per IP.

### 2.2. Input Validation & Injection Prevention
*   **SQL Injection (SQLi) Immunity:** [AUDITED & VERIFIED] 100% of database interactions utilize Prisma ORM parameterized queries. Zero instances of `$queryRaw`, `$queryRawUnsafe`, or string concatenation exist in the codebase.
*   **Error Masking:** [COMPLETED] Removed internal error details leakage (`details: String(error)`) from public endpoints (`/api/contact`, `/api/collab`) to prevent database structure disclosure.
*   **Payload Validation:** Strict validation of emails (`EMAIL_REGEX`), password bounds (8–128 chars), and promo codes on server routes.

## 3. Frontend & Client-Side Security (Next.js)

### 3.1. Cross-Site Scripting (XSS) & Content Security
*   **HTTP Security Headers:** [COMPLETED] Enforced via `next.config.ts`:
    - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: SAMEORIGIN`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
    - Fixed W3C CORS specification violation by removing `Access-Control-Allow-Credentials: true` from wildcard origin (`*`).
*   **React Hydration & Rich Text Sanitization:** [AUDITED & VERIFIED] All instances of `dangerouslySetInnerHTML` in dynamic components (`AnoseAssistant.tsx`, `AnaAdminAssistant.tsx`, `blog/[id]/page.tsx`) are processed through `sanitizeHtml` with strict allowlists (`allowedTags`, `allowedAttributes`, `allowedSchemes`). Static instances are limited strictly to schema `application/ld+json`.

### 3.2. State & Cart Tampering
*   **Server-Side Recalculation:** [AUDITED & VERIFIED] Frontend cart prices are never trusted. Both `/api/orders` and `/api/payment/initiate` extract product IDs, retrieve authorized prices from Supabase, recalculate subtotal, validate promo codes against DB limits, and enforce correct shipping fees entirely server-side.

## 4. Payment Processing & Compliance

### 4.1. Financial Data (PCI-DSS)
*   **Tokenization:** [AUDITED & VERIFIED] Under no circumstances are raw credit card numbers processed, transmitted, or stored on servers. Transactions route through hosted checkouts / SDKs (Razorpay & PhonePe).
*   **Webhook & Callback Cryptographic Verification:** [COMPLETED]
    - Webhook signatures and checksums are verified before any order state is transitioned to `PAID`.
    - Upgraded signature comparisons in `/api/payment/verify` and `/api/payment/webhook` to `crypto.timingSafeEqual` across Razorpay and PhonePe handlers to prevent side-channel timing attacks.

## 5. Infrastructure & DevSecOps
*   **Secret Management:** [COMPLETED]
    - Removed `.vercel.temp.env` from git tracking.
    - Updated `.gitignore` to strictly exclude all `.vercel*` files alongside `.env*` and `zoho-tokens.json`.
    - Verified zero `.env` or credential files are committed to version control.
*   **Admin Route Guarding:** Both client routes (`src/middleware.ts`) and all server API routes (`src/app/api/admin/*`) strictly verify `role === 'admin'` via `requireAdmin()`.