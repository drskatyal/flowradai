import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return <SignIn signUpUrl="/auth/sign-up" oauthFlow="popup" />;
};

export default SignInPage;
