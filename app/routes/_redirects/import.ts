import { redirect } from "react-router";

export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  return redirect(`/tempolis/import${url.search}`);
}
