import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // In a real app, validate and save to DB
    // Here we just return a mock success response
    
    return NextResponse.json({
      success: true,
      message: "Request submitted successfully",
      data: {
        id: "REQ-8924B",
        status: "Submitted",
        submittedAt: new Date().toISOString(),
        ...body
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
  }
}
