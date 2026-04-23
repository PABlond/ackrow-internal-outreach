import { redirect } from "react-router";

export function loader() {
  return redirect("/tempolis/prospects");
}

export default function SearchRedirect() {
  return null;
}
