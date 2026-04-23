import { Form, redirect, useLoaderData } from "react-router";
import { Save } from "lucide-react";

import type { Route } from "./+types/settings";
import {
  getWorkspaceSettings,
  requireWorkspace,
  runWorkspaceSettingsAction,
  type PromptTemplate,
  type WorkspaceDoc,
} from "~/lib/outreach.server";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export const meta: Route.MetaFunction = () => [
  { title: "Settings · Outreach" },
  { name: "description", content: "Workspace docs, prompts and model settings." },
];

export async function loader({ params }: Route.LoaderArgs) {
  const workspace = await requireWorkspace(params.workspaceSlug);
  return await getWorkspaceSettings(workspace.id);
}

export async function action({ request, params }: Route.ActionArgs) {
  const workspace = await requireWorkspace(params.workspaceSlug);
  const formData = await request.formData();
  await runWorkspaceSettingsAction(formData, workspace.id);
  return redirect(`/${workspace.slug}/settings`);
}

export default function SettingsPage() {
  const { workspace, docs, prompts } = useLoaderData<typeof loader>();

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Settings</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{workspace.name}</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Configure the workspace once here. Future generations read from the DB, not from the
              seed markdown files.
            </p>
          </div>
          <Badge variant="muted">/{workspace.slug}</Badge>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Name, product name and default generation language.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" className="grid gap-4 md:grid-cols-[1fr_1fr_160px_auto] md:items-end">
              <input type="hidden" name="intent" value="updateWorkspace" />
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={workspace.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productName">Product name</Label>
                <Input id="productName" name="productName" defaultValue={workspace.product_name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Language</Label>
                <Input id="defaultLanguage" name="defaultLanguage" defaultValue={workspace.default_language} required />
              </div>
              <Button type="submit">
                <Save className="size-4" />
                Save
              </Button>
            </Form>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <SectionTitle title="Docs" detail="Brand, ICP/playbook and examples used by prompts." />
          {docs.map((doc) => (
            <DocEditor key={doc.id} doc={doc} />
          ))}
        </section>

        <section className="space-y-4">
          <SectionTitle title="Prompts" detail="Saving a prompt creates a new active version." />
          {prompts.map((prompt) => (
            <PromptEditor key={prompt.id} prompt={prompt} />
          ))}
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function DocEditor({ doc }: { doc: WorkspaceDoc }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{doc.title}</CardTitle>
            <CardDescription>{doc.source_path || doc.type}</CardDescription>
          </div>
          <Badge variant="muted">{doc.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Form method="post" className="space-y-3">
          <input type="hidden" name="intent" value="updateDoc" />
          <input type="hidden" name="docId" value={doc.id} />
          <div className="space-y-2">
            <Label htmlFor={`doc-title-${doc.id}`}>Title</Label>
            <Input id={`doc-title-${doc.id}`} name="title" defaultValue={doc.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`doc-content-${doc.id}`}>Content</Label>
            <Textarea id={`doc-content-${doc.id}`} name="content" defaultValue={doc.content} rows={14} />
          </div>
          <Button type="submit" variant="outline" size="sm">
            <Save className="size-4" />
            Save doc
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}

function PromptEditor({ prompt }: { prompt: PromptTemplate }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{prompt.name}</CardTitle>
            <CardDescription>
              {prompt.channel} · {prompt.purpose}
            </CardDescription>
          </div>
          <Badge variant="info">v{prompt.version}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Form method="post" className="space-y-3">
          <input type="hidden" name="intent" value="updatePrompt" />
          <input type="hidden" name="promptId" value={prompt.id} />
          <div className="grid gap-3 md:grid-cols-[1fr_260px_140px]">
            <div className="space-y-2">
              <Label htmlFor={`prompt-name-${prompt.id}`}>Name</Label>
              <Input id={`prompt-name-${prompt.id}`} name="name" defaultValue={prompt.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`prompt-model-${prompt.id}`}>Model</Label>
              <Input id={`prompt-model-${prompt.id}`} name="model" defaultValue={prompt.model} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`prompt-temperature-${prompt.id}`}>Temperature</Label>
              <Input
                id={`prompt-temperature-${prompt.id}`}
                name="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                defaultValue={prompt.temperature}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`prompt-system-${prompt.id}`}>System prompt</Label>
            <Textarea id={`prompt-system-${prompt.id}`} name="systemPrompt" defaultValue={prompt.system_prompt} rows={4} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`prompt-user-${prompt.id}`}>User prompt</Label>
            <Textarea id={`prompt-user-${prompt.id}`} name="userPrompt" defaultValue={prompt.user_prompt} rows={18} required />
          </div>
          <Button type="submit" variant="outline" size="sm">
            <Save className="size-4" />
            Save new version
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
