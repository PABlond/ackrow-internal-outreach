import { redirect } from "react-router";

export function loader() {
  return redirect("/tempolis/import?source=linkedin");
}

export default function BatchRedirect() {
  return null;
}
