import { redirect } from "react-router";

export function loader() {
  return redirect("/prospects");
}

export default function SearchRedirect() {
  return null;
}
