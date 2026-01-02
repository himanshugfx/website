import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import MyAccountClient from "./MyAccountClient";
import { authOptions } from "@/lib/auth";

export default async function MyAccountPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    return <MyAccountClient user={session.user} />;
}
