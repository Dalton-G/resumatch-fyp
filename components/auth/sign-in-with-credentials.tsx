import { signIn } from "@/../auth";
import { signInWithCredentials } from "../../actions/auth";

export function SignInWithCredentials() {
  return (
    <form
      action={async (formData) => {
        "use server";
        await signInWithCredentials(formData);
      }}
    >
      <label>
        Email
        <input name="email" type="email"></input>
      </label>
      <label>
        Password
        <input name="password" type="password"></input>
      </label>
      <button type="submit">Sign In</button>
    </form>
  );
}
