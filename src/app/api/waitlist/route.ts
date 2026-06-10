import { NextRequest, NextResponse } from "next/server";

interface WaitlistEntry {
  email: string;
  createdAt: string;
}

// In-memory storage for the smoke test
const waitlist: WaitlistEntry[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Check if email already exists
    if (waitlist.some((entry) => entry.email === email)) {
      return NextResponse.json({ message: "Email already registered", email }, { status: 200 });
    }

    // Add to waitlist
    waitlist.push({
      email,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: "Successfully registered for early access", email },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    waitlistCount: waitlist.length,
    waitlist: waitlist.map((entry) => ({
      email: entry.email.replace(/(?<=.{2}).*(?=@)/, "***"),
      createdAt: entry.createdAt,
    })),
  });
}
