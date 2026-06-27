import { NextRequest, NextResponse } from "next/server";

const backendURL = process.env.NEXT_PUBLIC_MAIN_BACKEND || "";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${backendURL}/api/categories${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      // Cache at the edge so the homepage doesn't hit the backend every load.
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: "error", message: "Failed to fetch categories from backend" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
