import { ThreadPrimitive } from "@assistant-ui/react";
import { useUser } from "@clerk/nextjs";

const MyThreadWelcome = () => {
  const { user } = useUser();
  return (
    <ThreadPrimitive.Empty>
      <div className="flex flex-grow flex-col items-center justify-center h-full">
        <p className="m-4 font-medium text-center max-w-md">
          Welcome {user?.firstName}! Precision and speed at your fingertips -
          start your reporting now!
        </p>
      </div>
    </ThreadPrimitive.Empty>
  );
};

export default MyThreadWelcome;
