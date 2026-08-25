import {createNoteSchema} from "@/lib/validation/note.schema"
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-current-user";


export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const result = createNoteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { title, content } = result.data;

    const note = await prisma.note.create({
      data: {
        userId,
        title,
        content,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Note created successfully",
        note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create note error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create note",
      },
      { status: 500 }
    );
  }
}