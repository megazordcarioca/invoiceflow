import { NextResponse } from "next/server";
import { getBaselines } from "@/lib/ai-costs";

export async function GET() {
  try {
    const baselines = getBaselines();
    return NextResponse.json(baselines);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch baselines", details: String(err) },
      { status: 500 }
    );
  }
}
