import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const unlockSchema = z.object({
  accessKey: z.string().min(1, "Access key is required"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const body = await request.json();

    const result = unlockSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { accessKey } = result.data;

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

    // Make sure this endpoint is only used for password links
    if (shareLink.accessType !== "PASSWORD") {
      return NextResponse.json(
        {
          success: false,
          message: "This share link does not require a password",
        },
        { status: 400 }
      );
    }

    // Revoked
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

    if (!shareLink.accessKeyHash) {
      return NextResponse.json(
        {
          success: false,
          message: "Access key is not configured",
        },
        { status: 500 }
      );
    }

    // Verify the supplied key against the stored bcrypt hash
    const isValidKey = await bcrypt.compare(
      accessKey,
      shareLink.accessKeyHash
    );

    // Wrong password/key -> NO view count increase
    if (!isValidKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid access key",
        },
        { status: 401 }
      );
    }

    /*
     * ONE-TIME LINK
     *
     * We consume the link and increment the view count
     * inside one transaction.
     *
     * The conditional usedAt: null makes the operation atomic:
     * only one concurrent request can successfully consume it.
     */
    if (shareLink.shareType === "ONE_TIME") {
      const now = new Date();

      const result = await prisma.$transaction(async (tx) => {
        const consumed = await tx.shareLink.updateMany({
          where: {
            id: shareLink.id,
            usedAt: null,
            revokedAt: null,
          },
          data: {
            usedAt: now,
            viewCount: {
              increment: 1,
            },
          },
        });

        if (consumed.count !== 1) {
          return false;
        }

        return true;
      });

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            message: "This one-time share link has already been used",
          },
          { status: 410 }
        );
      }

      return NextResponse.json({
        success: true,
        note: shareLink.note,
        viewCount: 1,
      });
    }

    /*
     * TIME-BASED PASSWORD LINK
     *
     * Valid password = successful view.
     */
    const updatedShare = await prisma.shareLink.update({
      where: {
        id: shareLink.id,
      },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: {
        viewCount: true,
      },
    });

    return NextResponse.json({
      success: true,
      note: shareLink.note,
      viewCount: updatedShare.viewCount,
    });
  } catch (error) {
    console.error("Unlock share link error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to unlock share link",
      },
      { status: 500 }
    );
  }
}