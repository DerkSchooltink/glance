-- Group-synced spaces (lib/oidc-access.ts). SQLite cannot ADD COLUMN with a UNIQUE constraint, so
-- the uniqueness drizzle declares on the column is a separate index, named the way drizzle-kit
-- names it. NULL (every space not owned by the IdP) is not constrained by a UNIQUE index.
ALTER TABLE `spaces` ADD COLUMN `oidcGroup` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `spaces_oidcGroup_unique` ON `spaces` (`oidcGroup`);
