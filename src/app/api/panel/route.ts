import { NextResponse } from "next/server";
import { renderTrpcPanel } from "trpc-ui";
import { appRouter } from "@/server/api/root";

export async function GET(req: Request) {
	const html = renderTrpcPanel(appRouter, {
		url: "http://localhost:3000/api/trpc",
		transformer: "superjson",
	});

	return new NextResponse(html, {
		status: 200,
		headers: { "Content-Type": "text/html" },
	});
}
