import { auth } from "@/lib/auth";

const handle = (request: Request) => auth().handler(request);

export { handle as GET, handle as POST };
