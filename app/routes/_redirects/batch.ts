import { redirect } from "react-router";

export function loader() {
  return redirect("/import?source=linkedin");
}

export default function BatchRedirect() {
  return null;
}
