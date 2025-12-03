import { PrismaClient } from "@/app/generated/prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

interface LinearIssue {
  id: string;
  name: string;
  taskId: string;
  estimatedTime: number;
  delegateId: string | null;
  delegateName: string | null;
  projectName: string | null;
  createdAt: number;
  updatedAt: number;
}

export async function GET(request: NextRequest) {
  try {
       const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      prisma.linearTask.findMany({
        skip,
        take: limit,
        orderBy: {
          id: 'desc'
        }
      }),
      prisma.linearTask.count()
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
  
}