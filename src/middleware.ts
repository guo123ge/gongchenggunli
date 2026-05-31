import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/") return NextResponse.next();
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/daily-log/:path*", "/material/:path*", "/review/:path*"],
};

