-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL,
    "npm" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "ServerConfig" (
    "id" TEXT NOT NULL,
    "verifiedRoleId" TEXT NOT NULL,

    CONSTRAINT "ServerConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerMember" (
    "ssoUsername" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,

    CONSTRAINT "ServerMember_pkey" PRIMARY KEY ("ssoUsername","serverId")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "ssoUsername" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_npm_key" ON "User"("npm");

-- CreateIndex
CREATE UNIQUE INDEX "ServerMember_serverId_discordId_key" ON "ServerMember"("serverId", "discordId");

-- CreateIndex
CREATE INDEX "Message_serverId_idx" ON "Message"("serverId");

-- CreateIndex
CREATE INDEX "Message_ssoUsername_serverId_idx" ON "Message"("ssoUsername", "serverId");

-- AddForeignKey
ALTER TABLE "ServerMember" ADD CONSTRAINT "ServerMember_ssoUsername_fkey" FOREIGN KEY ("ssoUsername") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_ssoUsername_fkey" FOREIGN KEY ("ssoUsername") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
