import { redirect } from "next/navigation";

export default function AccountIndexPage() {
  redirect("/shop/account/orders");
}
