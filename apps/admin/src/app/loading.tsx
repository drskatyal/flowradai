import { Loader2 } from "lucide-react";
import { NextPage } from "next";

const Loading: NextPage = () => {
  return (
    <section className="flex justify-center items-center h-screen">
      <Loader2 className="animate-spin" />
    </section>
  );
};

export default Loading;
