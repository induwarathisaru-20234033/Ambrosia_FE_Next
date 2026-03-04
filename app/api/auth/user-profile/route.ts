const resolveBackendUrl = () => {
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_API;

  if (!backendBase) {
    return null;
  }

  const url = new URL("Auth/user-profile", backendBase);
  return url.toString();
};

export async function GET(request: Request) {
  const backendUrl = resolveBackendUrl();
  if (!backendUrl) {
    return Response.json(
      {
        succeeded: false,
        message: "Backend API not configured.",
        errors: ["Missing NEXT_PUBLIC_BACKEND_API."],
      },
      { status: 500 },
    );
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[auth/user-profile] proxying to", backendUrl);
  }

  if (
    process.env.ALLOW_SELF_SIGNED_CERTS === "true" &&
    process.env.NODE_ENV !== "production"
  ) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  const authHeader = request.headers.get("authorization");
  const backendResponse = await fetch(backendUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
  });

  const contentType = backendResponse.headers.get("content-type") || "";
  const payloadText = await backendResponse.text();

  if (contentType.includes("application/json")) {
    return new Response(payloadText, {
      status: backendResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(payloadText, {
    status: backendResponse.status,
    headers: { "Content-Type": contentType || "text/plain" },
  });
}
