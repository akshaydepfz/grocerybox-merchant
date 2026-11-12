import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Edge middleware placeholder.
 * Protected-route redirects and token checks will match Flutter once auth is integrated.
 */
export function middleware(request: NextRequest) {
  void request;
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
