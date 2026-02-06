import Form from "next/form";

import { signInWithGoogle } from "@/app/(auth)/actions";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      height="18"
      viewBox="0 0 24 24"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

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
          <GoogleIcon />
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
