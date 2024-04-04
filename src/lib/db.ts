import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

export const db = 
    globalForPrisma.prisma ??
    new PrismaClient({
        log: ['query'], 
    })

if (process.env.Node_ENV !== 'production') globalForPrisma.prisma = db