import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-current-user";

export async function POST(
  _: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      shareId: string;
    }>;
  }
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

    const { id: noteId, shareId } = await params;

    /*
     * Find the share link only if it belongs
     * to a note owned by the authenticated user.
     */
    const shareLink = await prisma.shareLink.findFirst({
      where: {
        id: shareId,
        noteId,
        note: {
          userId,
        },
      },
    });

    if (!shareLink) {
      return NextResponse.json(
        {
          success: false,
          message: "Share link not found",
        },
        { status: 404 }
      );
    }

    // Already revoked
    if (shareLink.revokedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Share link is already revoked",
        },
        { status: 409 }
      );
    }

    const revokedShare = await prisma.shareLink.update({
      where: {
        id: shareId,
      },
      data: {
        revokedAt: new Date(),
      },
      select: {
        id: true,
        token: true,
        revokedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Share link revoked successfully",
      share: revokedShare,
    });
  } catch (error) {
    console.error("Revoke share link error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to revoke share link",
      },
      { status: 500 }
    );
  }
}