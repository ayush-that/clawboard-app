CREATE TABLE IF NOT EXISTS "UserSettings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"openclawGatewayUrl" text,
	"openclawGatewayToken" text,
	"tamboApiKey" text,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "UserSettings_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
