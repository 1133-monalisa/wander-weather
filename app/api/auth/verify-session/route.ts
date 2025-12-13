import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { isLogged: false, error: "No token found" },
      { status: 401 }
    );
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    console.log(`✅ Token verified for user: ${decodedToken.uid}`);

    const uid = decodedToken.uid;
    const email = decodedToken.email;

    return NextResponse.json(
      {
        isLogged: true,
        uid,
        email,
        message: "Secure session verified",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token verification failed:", error);

    return NextResponse.json(
      { isLogged: false, error: "Invalid token" },
      { status: 403 }
    );
  }
}
