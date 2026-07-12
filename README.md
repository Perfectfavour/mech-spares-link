# FixLink

### Connecting Mechanics and Spare Parts Sellers in Abuja

**Live URL:** [https://fix-link.vercel.app/](https://fix-link.vercel.app/)

**Author:** Favour Yahaya

**Project Track:** 3MTT Knowledge Showcase MVP

**Deployment Target:** Mobile-First Web App (Optimized for Vercel)

---

## What is FixLink?

In Abuja, independent mechanics waste hours every day leaving their workshops, making dozens of phone calls, and wandering through local markets just to find a single spare part. This delays car repairs, loses them income, and frustrates vehicle owners.

FixLink is a mobile-first platform built to change this. It gives mechanics a direct digital link to trusted spare parts sellers in Abuja. Mechanics can easily search for parts by vehicle make and model, buy them instantly, and track their delivery status—all without leaving their workshop.

---

## How It Solves the "Hard-to-Find Parts" Problem

The standout feature of FixLink is what happens when a part isn't listed in the store:

1. **The Request:** If a mechanic searches for a rare or specific part and comes up empty, they fill out a quick form describing what they need (Vehicle Make, Model, Year, Part Name, and an optional photo).
2. **The Notification:** FixLink instantly alerts all verified sellers who specialize in that specific parts category.
3. **The Connection:** Instead of forcing users through a complicated bidding system, interested sellers immediately message the mechanic directly through the built-in app chat. They can share their price, confirm availability, and arrange delivery right inside the conversation.

---

## Core Features

* **Easy Onboarding & Security:** Built-in account creation, secure login, password resets, and email confirmations powered safely by Supabase.
* **Smart Image Compression:** Mechanics often upload photos of broken parts to show sellers what they need. FixLink automatically shrinks these images directly on the phone using HTML canvases before uploading them. This keeps the app incredibly fast, even on weak 3G or 4G mobile networks.
* **Flexible Payments:** Supports secure online payments (Cards, Bank Transfers, or USSD via Paystack using test keys) as well as a Pay on Delivery (POD) cash option.
* **Real-Time Order Tracking:** Mechanics can see exactly when their order is confirmed, packed, and out for delivery.

---

## The Technology Behind It

FixLink is built with a lightweight, modern stack designed to load quickly on mobile devices:

* **Frontend:** React with TypeScript and Tailwind CSS for a smooth, app-like experience.
* **Database & Storage:** Supabase handles the database, user accounts, and image uploads securely.
* **Payments:** Paystack handles the financial transactions safely without saving sensitive card details on our end.
* **Hosting:** Hosted on Vercel with clean routing rules so refreshing the page on a mobile browser never breaks the app or causes a 404 error.

---

## Product Workflows

### 1. Sourcing & Payment Flow (Mechanic Experience)

```
[Search or Request Part] ──> [Add to Cart] ──> [Checkout Screen]
                                                    │
             ┌───────────────── Chooses Online Payment ─────┴───── Chooses Pay on Delivery ──┐
             ▼                                                                               ▼
[Paystack Secure Popup Opens] ──> [Success Callback] ──> [Order Saved as Confirmed] <─── [Order Saved with POD Tag]
                                                                  │
                                                        [Track Order Status]

```

### 2. Digital Order Fulfillment Pipeline (Seller Workflow)

```
[Incoming Order Notification] ──> [Merchant Reviews Inventory] ──> [State Shift: Preparing]
                                                                            │
[Handover Complete (Delivered)] <── [State Shift: Out for Delivery] <─── [State Shift: Dispatched]

```

### 3. Requesting Unlisted Parts Flow

```
[Part Not Found] ──> [Mechanic Fills Out Request Form]
                                │
                                ▼
              [Sellers in Category are Notified]
                                │
                                ▼
            [Sellers Launch In-App Chat with Mechanic] ──> [Deal Closed via Chat]

```

---

## Configuration & Deployment Guide

Follow these configuration steps to get a local development copy up and running.

### 1. Dependency Acquisition

Ensure your execution ecosystem has Node.js installed. Clone the repository and fetch the node distributions:

```bash
npm install

```

### 2. Environment Schema Settings

Construct a standalone `.env` file within the system root directory and define the following context references:

```env
# Supabase Connectivity Credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anonymous-public-key

# Paystack API Public Key (Sandbox Testing Reference)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

```

### 3. Local Runtime Development Execution

Spin up the local compiler framework on the local loop:

```bash
npm run dev

```

### 4. Compiling Production Builds

To verify static generation outputs and execute TypeScript type-checking matrices prior to Vercel continuous deployment evaluations:

```bash
npm run build