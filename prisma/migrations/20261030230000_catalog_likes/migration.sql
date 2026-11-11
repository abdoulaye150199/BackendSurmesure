CREATE TABLE "CatalogLike" (
    "catalogItemId" UUID NOT NULL,
    "visitorId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CatalogLike_pkey" PRIMARY KEY ("catalogItemId", "visitorId"),
    CONSTRAINT "CatalogLike_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
