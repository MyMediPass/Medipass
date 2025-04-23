import { NextResponse } from "next/server"

export async function GET() {
  console.log("Test confirmation route called")
  return NextResponse.redirect(new URL("/auth/confirmation?status=success", "http://localhost:3000"))
}
