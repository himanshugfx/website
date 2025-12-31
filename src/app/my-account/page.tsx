import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import MyAccountClient from "./MyAccountClient";

export default async function MyAccountPage() {
    const session = await getServerSession();

    if (!session) {
        redirect("/login");
    }

    return <MyAccountClient user={session.user} />;
}
