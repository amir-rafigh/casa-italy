CREATE TABLE admin_users (
 id uuid PRIMARY KEY, username text NOT NULL UNIQUE,
 password_hash text NOT NULL, role text NOT NULL CHECK(role IN ('admin','staff')),
 active boolean NOT NULL DEFAULT true, session_version integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE categories (
 id text PRIMARY KEY, name text NOT NULL, sort_order integer NOT NULL DEFAULT 0,
 active boolean NOT NULL DEFAULT true
);
CREATE TABLE menu_items (
 id text PRIMARY KEY, category_id text NOT NULL REFERENCES categories(id),
 name text NOT NULL, english_name text NOT NULL, description text NOT NULL,
 ingredients jsonb NOT NULL CHECK(jsonb_typeof(ingredients)='array'),
 image_path text NOT NULL, image_alt text NOT NULL,
 price_toman integer NOT NULL CHECK(price_toman>0), available boolean NOT NULL DEFAULT true,
 active boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE restaurant_settings (
 id integer PRIMARY KEY CHECK(id=1), address text NOT NULL, phone text NOT NULL DEFAULT '',
 hours text NOT NULL, instagram text NOT NULL,
 capacity integer NOT NULL CHECK(capacity BETWEEN 1 AND 200),
 max_guests integer NOT NULL CHECK(max_guests BETWEEN 1 AND 20),
 horizon_days integer NOT NULL CHECK(horizon_days BETWEEN 1 AND 90),
 slot_times jsonb NOT NULL, slot_minutes integer NOT NULL CHECK(slot_minutes BETWEEN 30 AND 240)
);
CREATE TABLE reservation_slots (
 id uuid PRIMARY KEY, starts_at timestamptz NOT NULL UNIQUE, ends_at timestamptz NOT NULL,
 capacity integer NOT NULL CHECK(capacity BETWEEN 1 AND 200), closed boolean NOT NULL DEFAULT false,
 CHECK(ends_at>starts_at)
);
CREATE TABLE reservations (
 id uuid PRIMARY KEY, slot_id uuid NOT NULL REFERENCES reservation_slots(id),
 name text NOT NULL, phone text NOT NULL CHECK(phone ~ '^09[0-9]{9}$'),
 guests integer NOT NULL CHECK(guests BETWEEN 1 AND 20),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','rejected','cancelled')),
 owner_token_hash text NOT NULL, idempotency_key uuid NOT NULL, request_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(owner_token_hash,idempotency_key)
);
CREATE INDEX reservations_capacity_idx ON reservations(slot_id,status);
CREATE INDEX reservations_owner_idx ON reservations(owner_token_hash,created_at);
CREATE TABLE reservation_events (
 id uuid PRIMARY KEY, reservation_id uuid NOT NULL REFERENCES reservations(id),
 old_status text, new_status text NOT NULL, actor text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE audit_log (
 id uuid PRIMARY KEY, actor_id uuid REFERENCES admin_users(id),
 action text NOT NULL, target text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE rate_limits (
 key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL
);
