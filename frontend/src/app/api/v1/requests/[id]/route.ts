import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  
  // Mock response for tracking
  return NextResponse.json({
    success: true,
    data: {
      id: id,
      status: "Government Review",
      submittedAt: "2026-08-18T10:00:00Z",
      category: "Roads",
      severity: "High",
      description: "Large pothole on the main street causing traffic delays.",
      location: {
        publicSummary: "Downtown Area",
        // Redacted for privacy in public response
      },
      lifecycle: [
        { step: "Submitted", status: "completed", timestamp: "2026-08-18T10:00:00Z" },
        { step: "AI Analysis", status: "completed", timestamp: "2026-08-18T10:01:00Z" },
        { step: "Location Verified", status: "completed", timestamp: "2026-08-18T10:02:00Z" },
        { step: "Government Review", status: "current", timestamp: "2026-08-18T10:15:00Z" },
        { step: "Decision", status: "upcoming" },
        { step: "Implementation", status: "upcoming" },
        { step: "Completed", status: "upcoming" },
      ]
    }
  });
}
