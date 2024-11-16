import { redirect } from "next/navigation";
import { Navbar } from "../_components/navbar";
import { auth } from "@clerk/nextjs/server";

export default function Subscription() {
  const { userId } = auth();

  if (!userId) {
    redirect("/login");
  }

  return <Navbar />;
}
