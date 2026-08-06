-- Replace single `color` (String?) with `colors` (String[]) to support
-- selecting more than one color per product. Existing single-color values
-- are migrated into a one-element array rather than being dropped.
ALTER TABLE "Product" ADD COLUMN "colors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Product" SET "colors" = ARRAY["color"]::TEXT[] WHERE "color" IS NOT NULL;

ALTER TABLE "Product" DROP COLUMN "color";
