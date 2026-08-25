import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-current-user";

const createShareSchema = z
  .object({
    shareType: z.enum(["ONE_TIME", "TIME_BASED"]),
    accessType: z.enum(["PUBLIC", "PASSWORD"]),
    expiresAt: z.string().datetime().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.shareType === "TIME_BASED" && !data.expiresAt) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Expiry date/time is required for time-based links",
      });
    }

    if (data.expiresAt) {
      const expiryDate = new Date(data.expiresAt);

      if (expiryDate <= new Date()) {
        ctx.addIssue({
          code: "custom",
          path: ["expiresAt"],
          message: "Expiry date/time must be in the future",
        });
      }
    }
  });

export async function POST(
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

    const { id: noteId } = await params;

    // Make sure the note belongs to the logged-in user
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
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

    const body = await request.json();

    const result = createShareSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { shareType, accessType, expiresAt } = result.data;

    // Generate cryptographically secure share token
    const token = randomBytes(32).toString("base64url");

    let accessKey: string | null = null;
    let accessKeyHash: string | null = null;

    // Generate dynamic access key only for password-protected links
    if (accessType === "PASSWORD") {
      accessKey = randomBytes(12).toString("base64url");

      accessKeyHash = await bcrypt.hash(accessKey, 12);
    }

    const shareLink = await prisma.shareLink.create({
      data: {
        noteId,
        token,
        shareType,
        accessType,
        accessKeyHash,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      select: {
        id: true,
        token: true,
        shareType: true,
        accessType: true,
        expiresAt: true,
        viewCount: true,
        createdAt: true,
      },
    });

    const shareUrl = `${request.nextUrl.origin}/share/${shareLink.token}`;

    return NextResponse.json(
      {
        success: true,
        message: "Share link created successfully",
        share: {
          ...shareLink,
          shareUrl,
          accessKey,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create share link error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create share link",
      },
      { status: 500 }
    );
  }
}