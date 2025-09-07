<div dir="rtl">

# תדר — Backend API (Node.js/Express + PostgreSQL)

שרת REST מודולרי לניהול מאגר ידע של מכשירים, קטגוריות ותתי־קטגוריות, כולל העלאת קבצים מצורפים, אימות JWT והרשאות מבוססות תפקידים (RBAC), חיפוש ועימוד. מיועד לעבוד כ־API לשכבת פרונט (SPA/Vite/React) או כל קליינט אחר.

---

## תוכן העניינים

- [תקציר](#תקציר)
- [תכונות עיקריות](#תכונות-עיקריות)
- [ארכיטקטורה והמבנה הלוגי](#ארכיטקטורה-והמבנה-הλογי)
- [דרישות קדם](#דרישות-קדם)
- [התקנה מהירה (Quickstart)](#התקנה-מהירה-quickstart)
- [משתני סביבה](#משתני-סביבה)
- [סכמת בסיס נתונים (DDL)](#סכמת-בסיס-נתונים-ddl)
- [הרצה](#הרצה)
- [Docker (אופציונלי)](#docker-אופציונלי)
- [סקירת API](#סקירת-api)

  - [Auth](#auth)
  - [Categories](#categories)
  - [Subcategories](#subcategories)
  - [Devices](#devices)
  - [Attachments](#attachments)

- [מדיניות הרשאות (RBAC)](#מדיניות-הרשאות-rbac)
- [קונבנציות תגובה ושגיאות](#קונבנציות-תגובה-ושגיאות)
- [אבטחה והקשחות](#אבטחה-והקשחות)
- [מבנה פרויקט](#מבנה-פרויקט)
- [בדיקות ותיעוד](#בדיקות-ותיעוד)
- [מפת דרכים](#מפת-דרכים)
- [רישיון](#רישיון)

---

## תקציר

ה־API מספק CRUD מלא על קטגוריות/תתי־קטגוריות/מכשירים וניהול קבצים מצורפים לכל מכשיר. אימות מבוצע עם JSON Web Tokens, והרשאות מנוהלות לפי תפקידי משתמשים: `viewer` (קריאה בלבד), `editor` (CRUD על תוכן), `admin` (ניהול מלא + משתמשים).

## תכונות עיקריות

- **אימות והרשאות** — JWT + RBAC (`viewer`/`editor`/`admin`).
- **חיפוש ועימוד** — פרמטרים `?search=&page=&limit=` בכל רשימות התוכן.
- **קבצים מצורפים** — העלאה מרובת קבצים (Multer) וקישור ל־device; הגשה סטטית תחת `/uploads`.
- **מחיקות עמוקות** — טרנזקציות DB למחיקת קטגוריות/תתי־קטגוריות כולל תלויות וקבצים.
- **אבטחה** — `helmet`, `cors` עם whitelist, ו־`rate-limit` לנקודות רגישות.

## ארכיטקטורה והמבנה הלוגי

Node.js (Express) ↔ PostgreSQL. שכבות: `routes → controllers → models → db` בתוספת `middleware` (auth/roles/validation) ו־`utils` (עימוד, ניהול שגיאות).

## דרישות קדם

- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm ≥ 9

## התקנה מהירה (Quickstart)

```bash
# 1) שכפול ריפוזיטורי
git clone https://github.com/Shmuel18/development.git
cd development

# 2) התקנת תלויות
npm i

# 3) קובץ סביבה
cp .env.example .env
# ערכו את הערכים לפי סביבתכם

# 4) יצירת מסד והרצת DDL (ראו סעיף DDL)
# psql -U postgres -h localhost -d teder -f ./docs/sql/schema.sql

# 5) הרצה
npm run dev   # אם קיים nodemon
# או
node server.js
```

## משתני סביבה

צרו `.env` על בסיס הדוגמה:

```dotenv
# Database
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=teder
DB_USER=postgres
DB_PASSWORD=postgres

# Auth
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# CORS (רשימה מופרדת בפסיק)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Uploads
UPLOADS_DIR=uploads
MAX_UPLOAD_MB=20
```

## סכמת בסיס נתונים (DDL)

> ניתן להריץ ישירות ב־psql או להעביר לקבצי מיגרציה (Knex/Prisma וכו׳)

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('viewer','editor','admin')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(name, category_id)
);

CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  frequency_range TEXT,
  year INT,
  security_classification TEXT,
  description TEXT,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id INT REFERENCES subcategories(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  device_id INT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,       -- שם הקובץ בדיסק
  original_name TEXT NOT NULL,   -- שם קובץ מקורי
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_name ON devices USING GIN (to_tsvector('simple', name));
```

## הרצה

- **פיתוח**: `npm run dev` (נודמון) או `node server.js`.
- **פרודקשן**: `NODE_ENV=production npm start` (ודאו ש־`PORT` ו־`.env` מוגדרים).
- **סטטיקה**: קבצים זמינים ב־`GET /uploads/<file_name>`.

## Docker (אופציונלי)

**Dockerfile (דוגמה):**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","server.js"]
```

**docker-compose.yml (דוגמה):**

```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: teder
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: .
    environment:
      DB_HOST: db
      DB_PORT: 5432
      DB_DATABASE: teder
      DB_USER: postgres
      DB_PASSWORD: postgres
      JWT_SECRET: change_me
      CORS_ORIGINS: http://localhost:5173
    ports:
      - "3000:3000"
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

volumes:
  pgdata:
```

## סקירת API

**בסיס**: `/api`

### Auth

- `POST /api/auth/register` — יצירת משתמש (בפרודקשן מומלץ להגביל ל־admin בלבד).
- `POST /api/auth/login` — התחברות, החזרה של JWT.

**דוגמת בקשה:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret"}'
```

### Categories

- `GET /api/categories?search=&page=&limit=`
- `POST /api/categories` (roles: `editor|admin`)
- `PATCH /api/categories/:id` (roles: `editor|admin`)
- `DELETE /api/categories/:id` (roles: `admin`) — מחיקה עמוקה.

### Subcategories

- `GET /api/subcategories?categoryId=&search=&page=&limit=`
- `POST /api/subcategories` (roles: `editor|admin`)
- `PATCH /api/subcategories/:id` (roles: `editor|admin`)
- `DELETE /api/subcategories/:id` (roles: `admin`)

### Devices

- `GET /api/devices?categoryId=&subcategoryId=&search=&page=&limit=`
- `GET /api/devices/:id`
- `POST /api/devices` (roles: `editor|admin`)
- `PATCH /api/devices/:id` (roles: `editor|admin`)
- `DELETE /api/devices/:id` (roles: `admin`)

**דוגמת יצירה:**

```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"FT-897",
    "manufacturer":"Yaesu",
    "model":"FT-897D",
    "frequency_range":"HF/VHF/UHF",
    "year":2003,
    "category_id":1,
    "subcategory_id":2
  }'
```

### Attachments

- `POST /api/devices/:id/attachments` — העלאת קבצים (multipart/form-data). שם שדה הקבצים: `files` (Array).
- סטטיקה: `GET /uploads/<file_name>`

**דוגמת העלאה:**

```bash
curl -X POST http://localhost:3000/api/devices/1/attachments \
  -H "Authorization: Bearer <TOKEN>" \
  -F "files=@/path/to/file.pdf" \
  -F "files=@/path/to/image.png"
```

## מדיניות הרשאות (RBAC)

- `viewer` — פעולות קריאה (GET) בלבד.
- `editor` — CRUD על קטגוריות/תתי־קטגוריות/מכשירים/קבצים.
- `admin` — כל מה של־editor + ניהול משתמשים ומחיקות עמוקות.

## קונבנציות תגובה ושגיאות

**הצלחה**

```json
{
  "success": true,
  "data": {
    /* payload */
  },
  "meta": { "page": 1, "limit": 10, "total": 42 }
}
```

**שגיאה**

```json
{ "success": false, "error": "ValidationError", "message": "name is required" }
```

## אבטחה והקשחות

- **CORS** — הגדירו `CORS_ORIGINS` לאתרים מורשים בלבד.
- **Rate Limit** — מומלץ מגביל ייעודי ל־`/api/auth/login` לצמצום brute‑force.
- **Multer** — סינון MIME/סיומת כפולה + גודל מקסימלי (`MAX_UPLOAD_MB`).
- **JWT** — `JWT_SECRET` חזק ותוקף סביר (`JWT_EXPIRES_IN`).
- **מחיקות** — טרנזקציות DB + מחיקה אסינכרונית של קבצים (`fs.promises.unlink`).

## מבנה פרויקט

```text
.
├─ server.js
├─ routes/
│  ├─ auth.js
│  ├─ categories.js
│  ├─ subcategories.js
│  └─ devices.js
├─ controllers/
│  ├─ authController.js
│  ├─ categoriesController.js
│  ├─ subcategoriesController.js
│  ├─ devicesController.js
│  └─ attachmentsController.js
├─ models/
│  ├─ user.js
│  ├─ category.js
│  ├─ subcategory.js
│  ├─ device.js
│  └─ attachment.js
├─ middleware/
│  ├─ protect.js
│  ├─ authorize.js
│  └─ validate.js
├─ utils/
│  ├─ db.js
│  ├─ pagination.js
│  └─ errors.js
├─ uploads/            # קבצים סטטיים (נגישים דרך /uploads)
├─ docs/
│  ├─ sql/schema.sql   # מומלץ: דוחפים לכאן את ה-DDL
│  └─ postman/         # מומלץ: אוסף Postman
├─ .env.example
└─ README.md
```

## בדיקות ותיעוד

- **Postman** — מומלץ לאסוף את כל המסלולים בקובץ `docs/postman/Teder.postman_collection.json`.
- **OpenAPI/Swagger** — אופציונלי ב־`/docs`.
- **בדיקות** — Jest + Supertest (בהמשך המפה): `npm test`.

## מפת דרכים

- [ ] טרנזקציה להעלאות מרובות + ניקוי קבצים במקרה כשל
- [ ] Allowlist לשדות עדכון ב־`devices`
- [ ] ולידציית Joi ל־devices/categories/subcategories
- [ ] Rate limit ייעודי ל־login
- [ ] Swagger `/docs`
- [ ] Dockerfile + docker-compose רשמיים
- [ ] CI (GitHub Actions) להרצת בדיקות אוטומטית

## רישיון

MIT (או אחר לפי החלטה). מומלץ להוסיף קובץ `LICENSE` בריפו.

</div>
