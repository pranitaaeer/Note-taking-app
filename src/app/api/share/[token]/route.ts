import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const shareLink = await prisma.shareLink.findUnique({
      where: {
        token,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
      },
    });

    // Invalid token
    if (!shareLink) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid share link",
        },
        { status: 404 }
      );
    }

    // Revoked link
    if (shareLink.revokedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "This share link has been revoked",
        },
        { status: 410 }
      );
    }

    // Time-based expiry
    if (
      shareLink.shareType === "TIME_BASED" &&
      (!shareLink.expiresAt || shareLink.expiresAt <= new Date())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This share link has expired",
        },
        { status: 410 }
      );
    }

    // One-time link already used
    if (
      shareLink.shareType === "ONE_TIME" &&
      shareLink.usedAt
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This one-time share link has already been used",
        },
        { status: 410 }
      );
    }

    // Password-protected links should not expose note content
    if (shareLink.accessType === "PASSWORD") {
      return NextResponse.json({
        success: true,
        requiresPassword: true,
        share: {
          id: shareLink.id,
          shareType: shareLink.shareType,
          accessType: shareLink.accessType,
          expiresAt: shareLink.expiresAt,
        },
      });
    }

    /*
     * PUBLIC ACCESS
     *
     * For a one-time public link we atomically mark it as used.
     * This prevents two simultaneous requests from consuming
     * the same one-time link.
     */
    if (shareLink.shareType === "ONE_TIME") {
      const result = await prisma.shareLink.updateMany({
        where: {
          id: shareLink.id,
          usedAt: null,
          revokedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      if (result.count !== 1) {
        return NextResponse.json(
          {
            success: false,
            message: "This one-time share link has already been used",
          },
          { status: 410 }
        );
      }
    }

    // Count only successful public access
    await prisma.shareLink.update({
      where: {
        id: shareLink.id,
      },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      requiresPassword: false,
      note: shareLink.note,
      viewCount: shareLink.viewCount + 1,
    });
  } catch (error) {
    console.error("Share link access error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to access share link",
      },
      { status: 500 }
    );
  }
}