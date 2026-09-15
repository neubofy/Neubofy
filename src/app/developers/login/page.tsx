import { redirect } from "next/navigation";

export default function DevelopersLoginRedirect() {
  redirect("/partner/login");
}
