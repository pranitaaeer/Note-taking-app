# 🔒 Secure Note-Taking App

A secure note-sharing application built with Next.js, TypeScript, Hono.js/API Route Handlers, PostgreSQL, Prisma, Tailwind CSS, and shadcn/ui.

The application allows users to create notes and generate secure share links with:
- Public access
- Password-protected access
- One-time access
- Time-based expiry
- Link revocation
- Accurate view tracking
- Atomic one-time link consumption

---

## 🛠️ 1. Setup Instructions

### Prerequisites
Make sure you have the following installed:
- Node.js 18+
- npm
- A PostgreSQL database *(This project uses Neon PostgreSQL, so a local PostgreSQL installation is not required).*

### Clone the Repository
```bash
git clone [https://github.com/pranitaaeer/Note-taking-app.git](https://github.com/pranitaaeer/Note-taking-app.git)
cd note-taking-app
```

### Install Dependencies
```bash
npm install
```

### Environment Variables
Create a `.env` file in the root directory and add your configuration:
```env
DATABASE_URL="your_neon_postgresql_connection_string"
JWT_SECRET="your_JWT_SECRET"
```

### Database Setup & Migration
```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### Start Development Server
```bash
npm run dev
```

---

## 🚀 2. Tech Stack

### Frontend
- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**

### Backend
- **Next.js Route Handlers**
- **Prisma ORM**
- **bcryptjs**

### Database
- **PostgreSQL** (Neon PostgreSQL)

### Validation & Auth
- **Zod** (Validation)
- **JWT** (JWT-based authentication)

---

## 📊 3. Database Schema

The application mainly uses the following models:

### 👤 User
Stores registered users.
* **Important fields:** `id`, `name`, `email`, `password`, `timestamps`
* *Note: Passwords are stored as hashes and are never stored as plaintext.*

### 📝 Note
Stores the actual note created by a user.
* **Important fields:** `id`, `userId`, `title`, `content`, `timestamps`
* *Note: A note belongs to a user.*

### 🔗 ShareLink
Stores information about a shareable link.
* **Important fields:** `id`, `noteId`, `token`, `shareType`, `accessType`, `accessKeyHash`, `expiresAt`, `usedAt`, `revokedAt`, `viewCount`, `timestamps`

| Share Types | Access Types |
| :--- | :--- |
| `ONE_TIME` | `PUBLIC` |
| `TIME_BASED` | `PASSWORD` |

---

## 🔄 4. Share Link Flow

```text
User creates a note
        │
        ▼
User selects share type (ONE_TIME / TIME_BASED)
        │
        ▼
User selects access type (PUBLIC / PASSWORD)
        │
        ▼
Backend generates secure token
        │
        ▼
ShareLink is stored in PostgreSQL
        │
        ▼
Share URL is returned to frontend
```
*For password-protected links, a dynamic access key is also generated. The creator receives the access key after creating the protected share link.*

---

## 🔐 5. Password / Access Key Generation

For password-protected share links, the backend generates a random access key. The plaintext access key is returned to the creator when the share link is created, but the database **does NOT store the plaintext key**.

```text
Generated Access Key 
       │
       ▼
   bcrypt.hash()
       │
       ▼
accessKeyHash stored in database
```

**Validation Flow:**
```text
Entered Access Key
       │
       ▼
  bcrypt.compare()
       ├──── Invalid ──► 401 Unauthorized
       │
       └──── Valid ────► Note is unlocked
```

---

## ⏳ 6. Expiry Logic

Time-based share links contain an `expiresAt` timestamp.
* When a share link is accessed, if `expiresAt <= current time`, the link has expired.
* The API returns **`410 Gone`**, and the note is not returned.
* One-time links are expired after their first successful access using the `usedAt` field.

---

## 🚫 7. Invalidate / Revoke Logic

A share link can be manually revoked by the note owner.
* When revoked, `revokedAt = current timestamp`.
* Any future request checks if `revokedAt != null` and returns **`410 Gone`**.

---

## 👁️ 8. View Count Logic

The `viewCount` field tracks successful views based on strict rules:
- **Public link:** A successful public access increments `viewCount + 1`.
- **Password-protected link:** Only a successful password verification increments the view count. 
- **Wrong password:** Does **NOT** increment the view count.
- **Expired / revoked link:** Does **NOT** increment the view count.
- **One-time link:** A successful one-time access increments the view count exactly once using Prisma's atomic increment:
  ```ts
  viewCount: {
    increment: 1
  }
  ```

---

## ⚡ 9. Race-Condition Handling

One-time links must only be usable once. The application uses an atomic conditional database update.
The update checks:
```sql
usedAt IS NULL
```
before marking the link as used. Conceptually:

```sql
UPDATE ShareLink
SET usedAt = current_time,
    viewCount = viewCount + 1
WHERE id = shareLinkId
AND usedAt IS NULL
AND revokedAt IS NULL
```

The database returns the number of affected rows:
- If **`count = 1`**, the request successfully claimed the link.
- If **`count = 0`**, another request already consumed the link.

This prevents two concurrent users from successfully using the same one-time link.

---

## 👥 10. How do you prevent two users from using a one-time link at the same time?

I use an atomic conditional database update.
- The update only succeeds when `usedAt IS NULL`.
- The first request changes `usedAt` from `NULL` to the current timestamp.
- Any concurrent request will then affect zero rows and will receive an "already used" response.
- This makes the one-time link consumption safe under concurrent requests.

---

## 📈 11. How do you update view count safely?

I use the database's atomic increment operation:
```ts
viewCount: {
  increment: 1
}
```
For one-time links, marking the link as used and incrementing the view count are performed together so that a successful one-time access is counted exactly once. This avoids race conditions and lost updates.

---

## 🌍 12. How would this work if 1 million people opened the link?

The application is designed so that share-link validation and view updates are handled by the backend and PostgreSQL rather than storing state in the browser. 

For a large number of users, I would scale the application horizontally:
```text
Users
  │
  ▼
Load Balancer
  ├── Next.js Server
  ├── Next.js Server
  └── Next.js Server
          │
          ▼
      PostgreSQL
```

For very high traffic, I would additionally introduce:
- Redis for caching frequently accessed share-link metadata
- Rate limiting
- Database connection pooling
- CDN / edge caching where appropriate
- Background processing for analytics
- Read replicas for read-heavy workloads

*For one-time links, the final consumption decision must still be performed atomically against the authoritative database.*

---

## 🛡️ 13. How would you prevent brute-force attempts on password-protected links?

The access key is stored as a bcrypt hash, so the original key cannot be recovered from the database. For production-scale protection, I would also implement rate limiting on the unlock endpoint.

For example:
```text
Multiple failed attempts
        │
        ▼
Rate limit by IP + share token
        │
        ▼
Temporary blocking / increasing delay
```

Additional protections could include:
- Maximum attempts per IP
- Maximum attempts per share token
- Progressive delays
- Temporary lockout
- Monitoring suspicious activity
- Redis-based rate limiting for distributed servers

This prevents attackers from repeatedly guessing access keys.

---

## 🔌 14. API Share Flow

### Create Share Link
`POST /api/notes/:id/share`
- Creates a secure share link.

### Access Share Link
`GET /api/share/:token`
- Used for public share links and for checking whether a password is required.

### Unlock Password-Protected Link
`POST /api/share/:token/unlock`
- Request body:
  ```json
  {
    "accessKey": "generated-access-key"
  }
  ```

### Revoke Share Link
`DELETE /api/share/:token`
- Revokes the share link.

---

## 📌 15. Required Edge Cases

The application handles:
- Invalid share link
- Public share link access
- Password-protected share link access
- Wrong password/access key
- Expired share link
- One-time link already used
- Revoked share link
- Concurrent access to one-time links
- Accurate view count updates

---

## 📂 16. Pages

- `/login` - User login.
- `/register` - New user registration.
- `/notes/new` - Create a note.
- `/notes/[id]` - View note details and create/revoke share links.
- `/share/[token]` - Public/password-protected shared note page.

---

## 🔒 17. Security Considerations

The application follows several security practices:
- Passwords are hashed.
- Share access keys are stored as bcrypt hashes.
- Share tokens are generated securely.
- Note content is not exposed before password verification.
- Wrong passwords do not increase view count.
- Revoked links cannot be accessed.
- Expired links cannot be accessed.
- One-time links are consumed atomically.
- View count updates use atomic database operations.
- Input validation is performed using Zod.

---

## 🚀 18. Future Improvements

For a production-scale application, I would additionally implement:
- Redis-based rate limiting
- Redis caching
- Email sharing
- Audit logs
- Advanced analytics
- IP/device based abuse detection
- CSRF protection where applicable
- Security headers
- Automated tests
- Monitoring and alerting

---

## 🌐 19. Demo

- **Live Demo:** `https://note-taking-app-fawn-one.vercel.app/`
- **GitHub:** `https://github.com/pranitaaeer/Note-taking-app.git`
- **Demo Video:** `https://3jps3tx5py.ufs.sh/f/ZLv6Zyfgn4WcDQnBOmUfEGpTv5mg7tjycB2RMYkZNqazL1OU`

---

## 🔑 20. Test Credentials

- **Email:** `test2@gmail.com`
- **Password:** `test1234`