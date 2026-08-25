import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-current-user";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        shareLinks: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Get note error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch note",
      },
      { status: 500 }
    );
  }
}