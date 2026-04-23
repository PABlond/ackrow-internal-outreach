import { redirect } from "react-router";

export function loader() {
  return redirect("/import?source=x");
}

export default function TwitterRedirect() {
  return null;
}
