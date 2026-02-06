import Form from "next/form";

import { signInWithGoogle } from "@/app/(auth)/actions";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function AuthForm({
  action,
  children,
  defaultEmail = "",
  mode = "login",
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  mode?: "login" | "register";
}) {
  const isRegister = mode === "register";

  return (
    <div className="flex flex-col gap-4 px-4 sm:px-16">
      <form action={signInWithGoogle}>
        <Button
          className="w-full gap-2"
          size="lg"
          type="submit"
          variant="outline"
        >
          {/* biome-ignore lint/performance/noImgElement: static SVG doesn't need next/image */}
          <img alt="Google" height={20} src="/google-logo.svg" width={20} />
          Continue with Google
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-muted-foreground text-xs uppercase">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label
            className="font-normal text-zinc-600 dark:text-zinc-400"
            htmlFor="email"
          >
            Email Address
          </Label>

          <Input
            autoComplete="email"
            className="bg-muted text-md md:text-sm"
            defaultValue={defaultEmail}
            id="email"
            name="email"
            placeholder="user@acme.com"
            required
            type="email"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            className="font-normal text-zinc-600 dark:text-zinc-400"
            htmlFor="password"
          >
            Password
          </Label>

          <Input
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="bg-muted text-md md:text-sm"
            id="password"
            minLength={isRegister ? 6 : undefined}
            name="password"
            required
            type="password"
          />

          {isRegister && (
            <p className="text-muted-foreground text-xs">
              Must be at least 6 characters
            </p>
          )}
        </div>

        {children}
      </Form>
    </div>
  );
}
